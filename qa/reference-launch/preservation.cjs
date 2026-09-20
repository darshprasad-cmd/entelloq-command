/* Content and destination regression contract for the launch-page redesign.
 * Run: node qa/reference-launch/preservation.cjs [path/to/index.html]
 * Capture is intentionally pinned to the reviewed pre-redesign commit.
 * This checks preservation, not visual quality or browser interaction.
 * 2026-09-20 approved changes: retire Quant promotions/routes, refresh both
 * remaining previews, add recorded dissection/sandbox clips and update roster copy.
 * The original baseline stays immutable; exceptions below are exact and local. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const baselineCommit = '2ca3670';
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const normalize = value => value.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
  .replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const sections = ['products', 'tutorials', 'newsroom', 'platform', 'proof', 'leadership', 'company'];
const contractIds = ['prod-drop', 'drop-panel', 'theme-btn', 'theme-ic', 'tabbar', 'panels',
  'res-grid', 'proof-grid', 'foot-products', 'switcher', 'sw-grid', 'veil', 'pal-input',
  'pal-list', 'pal-count', 'lift', 'lift-icon', 'lift-name', 'lift-url', 'ag-fab',
  'ag-panel', 'ag-close', 'ag-log', 'ag-chips', 'ag-form', 'ag-input', 'eqx-fab',
  'eqx-panel', 'eqx-close', 'eqx-list'];
const revisedCopy = {
  platform: new Map([['Use the Entelloq logo at the bottom left of any app to open Physics, Quant or Biology, or return here.',
    'Use the Entelloq logo at the bottom left of any app to open Physics or Biology, or return here.']]),
  proof: new Map([['Quant Entelloq launched in July 2026. The numbers below are real, and updated as the network grows.',
    'Explore the simulations, concepts and living systems inside Physics and Biology Entelloq.']]),
  leadership: new Map([['He designs and engineers every Entelloq product end-to-end — the physics simulation engine, the market-practice environment and the biology atlas — as one connected platform rather than a collection of separate tools.',
    'He designs and engineers every Entelloq product end-to-end — the physics simulation engine and the biology atlas — as one connected platform rather than a collection of separate tools.']]),
  company: new Map([
    ['The company’s first product opens to the public, free of charge.',null],
    ['Within weeks of launch, the platform serves 700+ registered learners.',null]
  ])
};
const videoAction={title:'Watch the dissection lab',sub:'Recorded clips from Biology Entelloq',anchor:'#dissection',
  keywords:['video','clips','watch','dissection recording','frog','lab preview']};
const videoResource={lbl:'IN THE LAB',t:'Step inside the dissection lab',
  p:'Watch three short recordings from Biology Entelloq, then explore the virtual lab yourself.',link:'Watch the recordings',anchor:'#dissection'};
const guideResource={lbl:'GUIDES',t:'Start with a guided walkthrough',
  p:'Find the hand-motion sandbox in Physics and the dissection lab in Biology, step by step.',link:'Explore the guides',anchor:'#tutorials'};
const currentApps=[{p:'physics'},{p:'biology'}];
const videoAssistantAction={anchor:'#dissection',label:'Watch the dissection lab'};
const videoIntent={id:'lab-video',keywords:['watch the lab','dissection video','lab video','dissection clips','recording','recorded footage'],
  response:{html:'Watch three short clips recorded in the Biology Entelloq dissection lab, then open the guided lab to explore it yourself.',
    acts:[videoAssistantAction,{p:'biology'}],chips:['Tell me about Biology','How do I get started?']}};
function expectedAssistant(intent) {
  const expected=JSON.parse(JSON.stringify(intent));
  const r=expected.response;
  switch(expected.id){
    case 'what': r.html=r.html.replace("three\n      connected platforms — <b>Quant</b> (markets), <b>Physics</b>, and <b>Biology</b>","two\n      connected platforms — <b>Physics</b> and <b>Biology</b>");break;
    case 'choose':
      r.html=r.html.replace('<ul><li><b>Markets, trading, investing</b> → Quant Entelloq (live now)</li>\n      <li>','<ul><li>').replace('(private beta)','(open access)');
      r.chips=['Physics and exams','Life sciences','I want both'];break;
    case 'all':
      expected.keywords=['both','everything','all of them','all products'];
      r.html="They're built to connect. <b>Physics</b> is in early access and\n      <b>Biology</b> is in open access. Both are free right now.";
      r.acts=currentApps;break;
    case 'biology':
      r.html=r.html.replace('world — currently\n      in private beta.','world, available in open access.');
      r.acts=[...r.acts,videoAssistantAction];break;
    case 'price':r.acts=currentApps;break;
    case 'start':
      r.html=r.html.replace('<b>Quant</b> is the most complete today.','Explore a simulation in Physics or a virtual lab in Biology.');
      r.acts=currentApps;break;
    case 'new':
      r.html='The homepage now includes <b>recorded dissection clips</b> from Biology Entelloq\n      and refreshed previews of both apps. You can also explore the Physics and Biology guides.';break;
  }
  return expected;
}
function sectionHTML(html, id) {
  const match = html.match(new RegExp('<section\\b[^>]*\\bid=["\\\']' + id + '["\\\'][^>]*>([\\s\\S]*?)<\\/section>', 'i'));
  assert.ok(match, 'Missing page section #' + id);
  return match[1];
}
function evaluateData(html) {
  const start = html.indexOf('const PRODUCTS =');
  const end = html.indexOf('const $ ', start);
  assert.ok(start >= 0 && end > start, 'Product/config block must remain available');
  const data = vm.runInNewContext(html.slice(start, end) + '\n({PRODUCTS,TOPICS,ACTIONS,RESOURCES,PROOF})', {}, {timeout:1000});
  const assistantStart = html.indexOf('const PROD_BLURB =');
  const assistantEnd = html.indexOf('const AG_OPENING =', assistantStart);
  const assistant = vm.runInNewContext('const P=id=>PRODUCTS.find(p=>p.id===id);\n' +
    html.slice(assistantStart, assistantEnd) + '\nAG_INTENTS.map(i=>({id:i.id,keywords:i.k,response:i.r()}))',
    {PRODUCTS:data.PRODUCTS}, {timeout:1000});
  return JSON.parse(JSON.stringify({...data, assistant}));
}
function contentOnly(value) {
  if (Array.isArray(value)) return value.map(contentOnly);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !['accent', 'c', 'icon'].includes(key))
    .map(([key, item]) => [key, /Token$/.test(key) ? {sha256:digest(item)} : contentOnly(item)]));
  return value;
}
function capture(html) {
  const data = contentOnly(evaluateData(html));
  const sectionCopy = Object.fromEntries(sections.map(id => [id,
    [...sectionHTML(html, id).matchAll(/<(p|h3|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map(match => normalize(match[2])).filter(Boolean)]));
  const landmarkText = [...html.matchAll(/<(footer)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map(match => normalize(match[2]));
  const destinations = [...new Set([...html.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)]
    .map(match => match[2]).filter(value => !value.startsWith('data:') && !value.includes('${') &&
      !value.includes('fonts.google') && !value.includes("' +")))].sort();
  const portrait = html.match(/<img\b[^>]*class="face"[^>]*src="([^"]+)"/i);
  const companyBanner = sectionHTML(html, 'company').match(/<img\b[^>]*src="([^"]+)"/i);
  return {baselineCommit, sourceSha256:digest(html), sectionCopy, landmarkText,
    destinations, contractIds, founderPortraitSha256:digest(portrait[1]),
    companyBannerSha256:digest(companyBanner[1]), data};
}
if (process.argv.includes('--capture-baseline')) {
  assert.ok(!fs.existsSync(path.join(__dirname, 'baseline.contract.json')), 'Baseline already exists; do not silently regenerate it');
  const html = cp.execFileSync('git', ['show', baselineCommit + ':index.html'], {cwd:root,maxBuffer:2e6}).toString('utf8');
  fs.writeFileSync(path.join(__dirname, 'baseline.html'), html);
  fs.writeFileSync(path.join(__dirname, 'baseline.contract.json'), JSON.stringify(capture(html),null,2) + '\n');
  console.log('Captured immutable baseline from ' + baselineCommit);
} else {
  const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'baseline.contract.json'), 'utf8'));
  const target = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'index.html');
  const html = fs.readFileSync(target, 'utf8');
  const current = capture(html);
  const failures = [];
  function check(fn) { try {fn();} catch(error) {failures.push(error.message);} }
  for (const id of sections) for (const copy of baseline.sectionCopy[id]) {
    const expected=revisedCopy[id]?.has(copy)?revisedCopy[id].get(copy):copy;
    if(expected!==null)check(() => assert.ok(normalize(sectionHTML(html,id)).includes(expected), '#' + id + ' lost copy: ' + expected));
  }
  // Check footer atoms so adding a useful link or rearranging columns is allowed.
  const beforeHTML = fs.readFileSync(path.join(__dirname, 'baseline.html'), 'utf8');
  const beforeFooter = beforeHTML.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i)[1];
  const afterFooter = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i)?.[1] || '';
  for (const copy of beforeFooter.split(/<[^>]*>/).map(normalize).filter(Boolean)) {
    check(() => assert.ok(normalize(afterFooter).includes(copy), 'Footer content was lost: ' + copy));
  }
  for (const url of baseline.destinations.filter(url=>url!=='https://quant.entelloq.com')) check(() => assert.ok(current.destinations.includes(url), 'Destination was lost: ' + url));
  for (const id of contractIds) check(() => assert.equal([...html.matchAll(new RegExp('\\bid=["\\\']' + id + '["\\\']','g'))].length, 1, 'Control #' + id + ' must remain unique'));
  const expectedProducts=baseline.data.PRODUCTS.filter(product=>product.id!=='quant').map(product=>{
    // Both creeds were already in the immutable contract; retain their exact text.
    const {shotToken,...retained}=product;
    return {...retained,shot:'assets/previews/'+product.id+'-current.webp'};
  });
  const expectedResources=[videoResource,...baseline.data.RESOURCES.filter(item=>
    item.t!=='Quant Entelloq passes 700 registered users'&&item.launch!=='quant').map(item=>
      item.launch==='biology'?{...item,lbl:'BIOLOGY'}:item),guideResource];
  const expectedActions=[...baseline.data.ACTIONS.slice(0,2),videoAction,...baseline.data.ACTIONS.slice(2)];
  for(const [key,expected] of Object.entries({PRODUCTS:expectedProducts,TOPICS:baseline.data.TOPICS.filter(topic=>topic[1]!=='quant'),
    ACTIONS:expectedActions,RESOURCES:expectedResources,PROOF:baseline.data.PROOF.filter(item=>item.launch!=='quant')})){
    check(()=>assert.deepEqual(current.data[key],expected,key+' differs beyond the approved roster/media refresh'));
  }
  for (const intent of baseline.data.assistant.filter(intent=>intent.id!=='quant')) {
    const now = current.data.assistant.find(item => item.id === intent.id);
    check(() => assert.ok(now, 'Assistant lost intent: ' + intent.id));
    if (!now) continue;
    check(() => assert.deepEqual(now, expectedAssistant(intent), 'Assistant changed beyond the approved roster/media copy: ' + intent.id));
  }
  check(()=>assert.deepEqual(current.data.assistant.find(intent=>intent.id==='lab-video'),videoIntent,'Recorded lab assistant route differs'));
  check(()=>assert.deepEqual(current.data.assistant.map(intent=>intent.id).sort(),
    [...baseline.data.assistant.filter(intent=>intent.id!=='quant').map(intent=>intent.id),'lab-video'].sort(),'Unexpected assistant intents'));
  check(()=>assert.ok(!/https:\/\/quant\.entelloq\.com|data-launch=["']quant["']|Quant Entelloq/.test(html),'Removed Quant app is still promoted or routed'));
  for(const product of ['physics','biology'])for(const view of ['current','launch']){
    const asset='assets/previews/'+product+'-'+view+'.webp';
    check(()=>assert.ok(html.includes(asset),'Missing fresh preview: '+asset));
    check(()=>assert.ok(fs.statSync(path.join(root,asset)).size>1000,'Preview asset is missing/empty: '+asset));
  }
  check(()=>assert.ok(html.includes('id="dissection"'),'Missing recorded features section'));
  check(()=>assert.ok(normalize(sectionHTML(html,'dissection')).includes('Learning, in motion.'),'Missing requested feature heading'));
  const videos=[...html.matchAll(/<video\b[^>]*>[\s\S]*?<\/video>/gi)].map(match=>match[0]);
  check(()=>assert.equal(videos.length,6,'Expected standalone hero, three dissection clips and two sandbox clips'));
  for(const id of ['dissection-01','dissection-02','dissection-03','sandbox-01','sandbox-02']){
    check(()=>assert.equal(videos.filter(video=>video.includes('id="'+id+'"')).length,1,'Recorded clip must remain unique: '+id));
  }
  for(const video of videos){
    check(()=>assert.match(video,/\bpreload="none"/,'Video should defer downloads'));
    check(()=>assert.match(video,/\bplaysinline\b/,'Video should play inline on mobile'));
    check(()=>assert.doesNotMatch(video,/\s(?:src|autoplay)=|\sautoplay(?:\s|>)/,'Video must be lazy loaded without eager autoplay'));
    const source=video.match(/\bdata-src="([^"]+\.mp4)"/)?.[1];
    check(()=>assert.ok(source&&fs.statSync(path.join(root,source)).size>1000,'Missing recorded video source'));
  }
  check(() => assert.equal(current.founderPortraitSha256, baseline.founderPortraitSha256, 'Founder portrait changed'));
  check(() => assert.equal(current.companyBannerSha256, baseline.companyBannerSha256, 'Company name banner changed'));
  for (const token of ['data-open-switcher','data-open-palette',"localStorage.setItem('eq_theme'", "e.key === '/'", "e.key.toLowerCase() === 'k'", 'prefers-reduced-motion: reduce']) {
    check(() => assert.ok(html.includes(token), 'Missing interaction/motion hook: ' + token));
  }
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=|type=["'](?:module|application\/|importmap)/i.test(match[1]) || !match[2].trim()) continue;
    check(() => new Function(match[2]));
  }
  if (failures.length) { console.error(failures.join('\n\n')); process.exitCode=1; }
  else console.log('Preserved unaffected copy, founder/press/company data, links and controls against the immutable baseline. Approved refresh: 2 complete products, 11 topics, 5 actions, 6 newsroom items, 4 metrics, 17 assistant intents, 4 current WebP previews and 6 lazy video recordings.');
}
