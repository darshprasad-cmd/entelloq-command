const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const base = process.env.ENTELLOQ_QA_URL || 'http://127.0.0.1:8766/';
const output = path.join(__dirname,'browser-results');
fs.mkdirSync(output,{recursive:true});
const results = [], errors = [], badAssets = [];
let browser, context, page;
async function check(name, fn) {
  try {await fn();results.push({name,pass:true});console.log('PASS ' + name);}
  catch(error) {
    results.push({name,pass:false,error:error.message});console.log('FAIL ' + name + ': ' + error.message);
    await page?.screenshot({path:path.join(output,name.replace(/[^a-z0-9]/gi,'-')+'.png')}).catch(()=>{});
  }
}
async function load() {
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.locator('#panel-quant .copy').waitFor();
  await page.waitForFunction(() => document.body.classList.contains('motion-ready') || document.body.classList.contains('motion-paused'));
}
async function clickEscape(opener,panel,cls='open') {
  await opener.click();
  await page.waitForFunction(({selector,cls}) => document.querySelector(selector).classList.contains(cls),{selector:panel,cls});
  await page.waitForTimeout(90);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator(panel).evaluate((el,cls)=>el.classList.contains(cls),cls),false);
}
(async()=>{
  browser=await chromium.launch({headless:true});
  context=await browser.newContext({viewport:{width:1440,height:1000}});
  page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.url().startsWith(base)&&response.status()>=400)badAssets.push({url:response.url(),status:response.status()});});
  page.on('requestfailed',request=>{if(request.url().startsWith(base))badAssets.push({url:request.url(),error:request.failure()?.errorText});});
  await check('Page initializes all product and ecosystem content',async()=>{
    await load();
    assert.equal(await page.locator('#tabbar [role=tab]').count(),3);
    assert.equal(await page.locator('#eqx-list a').count(),4);
    assert.equal(await page.locator('#res-grid [data-res]').count(),6);
    assert.equal(await page.locator('#proof-grid [data-launch]').count(),6);
  });
  await check('All product tabs expose the correct content and app destination',async()=>{
    for(const id of ['physics','biology','quant']){
      await page.locator('#tab-'+id).click();
      assert.equal(await page.locator('#tab-'+id).getAttribute('aria-selected'),'true');
      assert.equal(await page.locator('#panel-'+id).isVisible(),true);
      assert.equal(await page.locator('#panel-'+id+' .copy a').getAttribute('href'),'https://'+id+'.entelloq.com');
      assert.equal(await page.locator('#panel-'+id+' .inc-row .inc').count(),4);
      for(const other of ['physics','biology','quant'].filter(x=>x!==id))assert.equal(await page.locator('#panel-'+other).isVisible(),false);
    }
  });
  await check('Search keyboard shortcut routes physics biology quant and founder queries',async()=>{
    await page.keyboard.press('Control+k');
    await page.locator('#pal-input').waitFor({state:'visible'});
    for(const [query,expected] of [['projectile','Physics Entelloq'],['DNA','Biology Entelloq'],['Black-Scholes','Quant Entelloq'],['founder','Leadership']]){
      await page.locator('#pal-input').fill(query);
      assert.ok((await page.locator('#pal-list').innerText()).includes(expected),query+' missing '+expected);
    }
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#veil').getAttribute('aria-hidden'),'true');
    await page.waitForFunction(()=>Math.abs(document.querySelector('#leadership').getBoundingClientRect().top)<150);
  });
  await check('Search empty state and slash shortcut close with Escape',async()=>{
    await page.locator('body').click({position:{x:5,y:400}});
    await page.keyboard.press('/');
    await page.locator('#pal-input').waitFor({state:'visible'});
    await page.locator('#pal-input').fill('unmatched_topic_zxqv_293');
    assert.ok((await page.locator('#pal-list').innerText()).includes('No'));
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#veil').getAttribute('aria-hidden'),'true');
  });
  await check('Launch dialog contains three apps traps focus and restores opener after Escape',async()=>{
    const opener=page.locator('.nav [data-open-switcher]').last();
    await opener.click();
    await page.waitForTimeout(90);
    assert.equal(await page.locator('#sw-grid [data-launch]').count(),3);
    assert.equal(await page.locator('#switcher').evaluate(el=>el.contains(document.activeElement)),true);
    await page.locator('#sw-grid [data-launch]').last().focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('#switcher').evaluate(el=>el.contains(document.activeElement)),true);
    await page.keyboard.press('Escape');
    assert.equal(await opener.evaluate(el=>el===document.activeElement),true);
  });
  await check('Bottom left switcher has all app URLs founder details and focus return',async()=>{
    await page.locator('#eqx-fab').click();
    await page.waitForTimeout(100);
    for(const id of ['quant','physics','biology'])assert.equal(await page.locator('#eqx-list a[href="https://'+id+'.entelloq.com"]').isVisible(),true);
    await page.locator('#eqx-panel .eqx-founder summary').click();
    assert.ok((await page.locator('#eqx-panel .eqx-founder').innerText()).includes('Darsh Prasad'));
    assert.equal(await page.locator('#eqx-panel a[href="https://entelloq.com/#leadership"]').isVisible(),true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#eqx-fab').evaluate(el=>el===document.activeElement),true);
    assert.equal(await page.locator('#eqx-fab').getAttribute('aria-expanded'),'false');
  });
  await check('Assistant answers product and founder questions with working action targets',async()=>{
    await page.locator('#ag-fab').click();
    await page.locator('#ag-input').fill('Tell me about Biology');
    await page.locator('#ag-form button[type=submit]').click();
    await page.locator('#ag-log [data-ag-launch="biology"]').waitFor();
    assert.ok((await page.locator('#ag-log').innerText()).includes('dissection'));
    await page.locator('#ag-input').fill('Who founded Entelloq?');
    await page.locator('#ag-form button[type=submit]').click();
    await page.locator('#ag-log [data-ag-go="#leadership"]').waitFor();
    assert.ok((await page.locator('#ag-log').innerText()).includes('Darsh Prasad'));
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#ag-fab').evaluate(el=>el===document.activeElement),true);
  });
  await check('Theme choice persists after reload',async()=>{
    const initial=await page.locator('html').getAttribute('data-theme');
    await page.locator('#theme-btn').click();
    const chosen=await page.locator('html').getAttribute('data-theme');
    assert.notEqual(initial,chosen);
    await load();
    assert.equal(await page.locator('html').getAttribute('data-theme'),chosen);
    await page.locator('#theme-btn').click();
  });
  await check('Tutorial entries preserve both exact live guide routes',async()=>{
    assert.equal(await page.locator('#tutorials a[href="https://physics.entelloq.com/?tutorial=hands"]').count(),1);
    assert.equal(await page.locator('#tutorials a[href="https://biology.entelloq.com/app.html?tutorial=dissection"]').count(),1);
    assert.equal(await page.locator('.watch-guide').getAttribute('href'),'#tutorials');
    await page.locator('.watch-guide').click();
    await page.waitForFunction(()=>Math.abs(document.querySelector('#tutorials').getBoundingClientRect().top)<150);
  });
  await check('Scroll motion moves Earth and pause persists after reload',async()=>{
    await page.evaluate(()=>window.scrollTo({top:200,behavior:'instant'}));
    await page.waitForTimeout(100);
    assert.notEqual(await page.locator('.earth-image').evaluate(el=>getComputedStyle(el).transform),'none');
    await page.locator('#motion-toggle').click();
    assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('motion-paused')),true);
    assert.equal(await page.locator('.earth-image').evaluate(el=>el.style.transform),'');
    await load();
    assert.equal(await page.locator('#motion-toggle').innerText(),'Resume motion');
    assert.equal(await page.locator('.scroll-pending').count(),0);
    await page.locator('#motion-toggle').click();
  });
  await check('Every local image and requested resource loads',async()=>{
    await page.evaluate(async()=>{await Promise.all([...document.images].map(image=>{image.loading='eager';return image.decode().catch(()=>{});}));});
    const broken=await page.locator('img').evaluateAll(images=>images.filter(image=>!image.complete||image.naturalWidth===0).map(image=>({alt:image.alt,src:image.src.slice(0,150)})));
    assert.deepEqual(broken,[]);
    assert.deepEqual(badAssets,[]);
  });
  for(const width of [320,390,768])await check('Mobile controls and page width '+width,async()=>{
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    const dimensions = await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth,
      overflow:[...document.querySelectorAll('body *')].map(el=>({tag:el.tagName,id:el.id,class:el.className,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}))
        .filter(el=>el.right>innerWidth+1 && el.left<innerWidth)}));
    assert.ok(dimensions.page<=dimensions.viewport+1,JSON.stringify(dimensions));
    await clickEscape(page.locator('#eqx-fab'),'#eqx-panel','eqx-open');
    await clickEscape(page.locator('.nav [data-open-switcher]').last(),'#switcher');
    await page.locator('#ag-fab').click();
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#ag-panel').isVisible(),true);
    if(width<=560)assert.equal(await page.locator('#ag-panel').getAttribute('aria-modal'),'true');
    await page.keyboard.press('Escape');
  });
  await context.close();
  context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await check('Reduced motion disables transforms pending reveals and progress effects',async()=>{
    await load();
    assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('motion-paused')),true);
    assert.equal(await page.locator('#motion-toggle').isDisabled(),true);
    assert.equal(await page.locator('#motion-toggle').innerText(),'Reduced motion is on');
    assert.equal(await page.locator('.scroll-pending').count(),0);
    await page.evaluate(()=>window.scrollTo({top:400,behavior:'instant'}));
    assert.equal(await page.locator('.earth-image').evaluate(el=>getComputedStyle(el).transform),'none');
    assert.equal(await page.locator('.reading-progress').isVisible(),false);
    assert.equal(await page.locator('#tutorials .sec-head').evaluate(el=>getComputedStyle(el).opacity),'1');
  });
  await check('No uncaught JavaScript exceptions',async()=>assert.deepEqual(errors,[]));
})().catch(error=>{results.push({name:'Fatal test error',pass:false,error:error.stack});console.error(error);}).finally(async()=>{
  await browser?.close();
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({url:base,time:new Date().toISOString(),results,errors,badAssets},null,2)+'\n');
  console.log(results.filter(x=>x.pass).length+'/'+results.length+' passed');
  if(results.some(x=>!x.pass))process.exitCode=1;
});
