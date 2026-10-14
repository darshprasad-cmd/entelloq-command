/* Behavioural checks for the authorized cinematic launch; existing contract remains. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.env.ENTELLOQ_QA_URL||'http://127.0.0.1:8766/';
const out=path.join(__dirname,'screenshots');fs.mkdirSync(out,{recursive:true});
const results=[],errors=[],assets=[];let browser;
async function check(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS '+name);}catch(e){results.push({name,pass:false,error:e.message});console.error('FAIL '+name+': '+e.message);}}
(async()=>{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)assets.push(r.url());});
 await page.goto(base,{waitUntil:'networkidle'});
 await check('Finished first frame with deferred media and initial transfer budget',async()=>{
  const values=await page.evaluate(()=>({videos:[...document.querySelectorAll('video')].map(v=>v.currentSrc),images:[...document.querySelectorAll('.aperture-art img')].every(i=>i.complete&&i.naturalWidth>0),transfer:performance.getEntriesByType('resource').filter(e=>e.name.startsWith(location.origin)).reduce((n,e)=>n+e.transferSize,0)+performance.getEntriesByType('navigation')[0].transferSize}));
  assert.ok(values.images);assert.ok(values.videos.every(v=>!v));assert.ok(values.transfer<1000000,'Initial local transfer exceeds 1 MB: '+values.transfer);results.push({name:'Initial local transfer bytes, unthrottled Chromium',value:values.transfer});
 });
 await check('Live illustrative scene advances, stops offscreen, and stops when paused',async()=>{
  const first=await page.locator('canvas').getAttribute('data-frame');await page.waitForTimeout(250);assert.notEqual(await page.locator('canvas').getAttribute('data-frame'),first);
  await page.locator('#faq').scrollIntoViewIfNeeded();await page.waitForTimeout(200);const stopped=await page.locator('canvas').getAttribute('data-frame');await page.waitForTimeout(250);assert.equal(await page.locator('canvas').getAttribute('data-frame'),stopped);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.locator('#motion-toggle').click();const paused=await page.locator('canvas').getAttribute('data-frame');await page.waitForTimeout(250);assert.equal(await page.locator('canvas').getAttribute('data-frame'),paused);await page.locator('#motion-toggle').click();
 });
 await check('Aperture transforms into reachable worlds and reverses without route changes',async()=>{
  await page.evaluate(()=>{const s=document.querySelector('.aperture-scroll-stage'),h=document.querySelector('.launch-scene');scrollTo({top:(s.offsetHeight-h.offsetHeight)*.91,behavior:'instant'});});await page.waitForTimeout(200);
  assert.equal(await page.locator('.portal-destination').getAttribute('aria-hidden'),'false');assert.equal(await page.locator('.portal-destination').evaluate(e=>e.inert),false);assert.ok(await page.locator('.portal-destination a').first().isVisible());assert.ok(Number(await page.locator('.aperture-scroll-stage').getAttribute('data-progress'))>.85);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(150);assert.equal(await page.locator('.portal-destination').getAttribute('aria-hidden'),'true');assert.equal(await page.locator('.launch-copy').evaluate(e=>e.inert),false);assert.equal(new URL(page.url()).hash,'');
 });
 await check('Small orbit buffer, invisible-scene stop and exact portrait breakpoint',async()=>{
  const pixels=await page.locator('#aperture-light').evaluate(c=>c.width*c.height);
  assert.ok(pixels<1440*1000/2,'Orbit still allocates a full-screen bitmap');
  await page.evaluate(()=>{const s=document.querySelector('.aperture-scroll-stage'),h=document.querySelector('.launch-scene');scrollTo({top:(s.offsetHeight-h.offsetHeight)*.99,behavior:'instant'});});await page.waitForTimeout(200);
  const stopped=await page.locator('#aperture-light').getAttribute('data-frame');await page.waitForTimeout(250);assert.equal(await page.locator('#aperture-light').getAttribute('data-frame'),stopped);
  await page.setViewportSize({width:600,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);
  assert.equal(await page.locator('#aperture-light').evaluate(c=>c.width*c.height),1);assert.match(await page.locator('.aperture-art img').evaluate(i=>i.currentSrc),/gateway-mobile/);
 });
 for(const width of [360,390,768,1440,1920])await check('Every section, reverse scrolling and resize at '+width,async()=>{
  await page.setViewportSize({width,height:width<700?844:1000});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);
  await page.screenshot({path:path.join(out,'gateway-'+width+'-hero.png')});
  for(const id of ['worlds','products','dissection','tutorials','newsroom','platform','proof','leadership','company','faq']){
   await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(50);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow at '+id);assert.ok(await page.locator('#'+id).isVisible());
   if([390,1440].includes(width))await page.screenshot({path:path.join(out,'gateway-'+width+'-'+id+'.png')});
  }
  await page.locator('footer').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'gateway-'+width+'-footer.png')});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.mouse.wheel(0,1600);await page.mouse.wheel(0,-1500);assert.ok(await page.locator('#launch-title').isVisible());
 });
 await check('Mobile menu, keyboard focus, section destination, Escape and FAQ',async()=>{
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.locator('.mobile-menu-toggle').click();assert.equal(await page.locator('#mobile-navigation').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#mobile-navigation').isVisible(),false);assert.equal(await page.locator('.mobile-menu-toggle').evaluate(e=>e===document.activeElement),true);
  await page.locator('.mobile-menu-toggle').click();await page.locator('#mobile-navigation a[href="#faq"]').click();assert.equal(await page.locator('#mobile-navigation').isVisible(),false);assert.equal(await page.locator('#faq').evaluate(e=>e===document.activeElement),true);
  const question=page.locator('#faq summary').first();await question.focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#faq details').first().getAttribute('open'),'');assert.notEqual(await question.evaluate(e=>getComputedStyle(e).outlineStyle),'none');
 });
 await check('All local section links resolve and headline remains selectable HTML',async()=>{
  const missing=await page.locator('a[href^="#"]').evaluateAll(links=>links.map(l=>l.getAttribute('href')).filter(h=>h.length>1&&!document.getElementById(h.slice(1))));assert.deepEqual(missing,[]);assert.equal(await page.locator('h1').count(),1);assert.ok((await page.locator('h1').textContent()).includes('Reality'));
 });
 await check('Portrait art source and tap targets',async()=>{
  assert.match(await page.locator('.aperture-art img').evaluate(i=>i.currentSrc),/gateway-mobile/);for(const s of ['.mobile-menu-toggle','#motion-toggle','.hero .btn.primary','.motion-link'])assert.ok((await page.locator(s).boundingBox()).height>=44,s+' below 44px');
 });
 await check('Failed artwork retains readable copy and working entry',async()=>{
  const fallback=await context.newPage();await fallback.route('**/assets/reality/**',r=>r.abort());await fallback.goto(base);await fallback.locator('.aperture-art.media-failed').waitFor();assert.ok(await fallback.locator('h1').isVisible());await fallback.locator('.nav .launch-btn').click();assert.equal(await fallback.locator('#switcher').getAttribute('aria-hidden'),'false');await fallback.close();
 });
 await check('No JavaScript fallback exposes both product entry points',async()=>{
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),p=await nojs.newPage();await p.goto(base);assert.ok(await p.locator('h1').isVisible());for(const name of ['physics','biology'])assert.ok(await p.locator('.world-entry[href="https://'+name+'.entelloq.com"]').isVisible());await nojs.close();
 });
 await check('Zero runtime errors and missing local assets',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(assets,[]);});
 await context.close();
})().catch(e=>{results.push({name:'fatal',pass:false,error:e.stack});}).finally(async()=>{await browser?.close();fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify({date:'2026-10-14',base,results,errors,assets},null,2));console.log(results.filter(r=>r.pass===true).length+' passed, '+results.filter(r=>r.pass===false).length+' failed');if(results.some(r=>r.pass===false))process.exitCode=1;});
