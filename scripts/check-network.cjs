const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let pages=0,scripts=0;
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html')&&!['404.html','googlea7845ca98ad93bc6.html'].includes(f))){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const block=html.match(/<!-- ENTELLOQ-ECOSYSTEM-SWITCHER:START -->[\s\S]*?<!-- ENTELLOQ-ECOSYSTEM-SWITCHER:END -->/);assert.ok(block,file+' missing switcher');
 assert.equal((html.match(/id="eqx-fab"/g)||[]).length,1,file+' duplicate launcher');
 for(const app of ['physics','biology'])assert.ok(block[0].includes('https://'+app+'.entelloq.com'),file+' missing '+app);
 assert.ok(!/https:\/\/quant\.entelloq\.com|Quant Entelloq/.test(block[0]),file+' still promotes removed Quant app');
 assert.ok(block[0].includes('Darsh Prasad'));assert.ok(block[0].includes('https://entelloq.com/#leadership'));
 assert.ok(block[0].includes('aria-expanded'));assert.ok(block[0].includes("e.key === 'Escape'"));
 for(const m of block[0].matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/\bsrc\s*=|type=["'](?:module|application\/|importmap)/i.test(m[1])||!m[2].trim())continue;new Function(m[2]);scripts++;}pages++;
}
console.log(pages+' pages: unique launcher, two app links and corporate home, founder details and '+scripts+' navigation scripts checked.');
