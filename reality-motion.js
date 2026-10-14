/* Optical motion is illustrative. No scientific values or simulated time here. */
(() => {
  'use strict';
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const body=document.body,hero=document.querySelector('.launch-scene');
  const art=document.querySelector('.aperture-art'),canvas=document.querySelector('#aperture-light');
  const ctx=canvas?.getContext('2d'),toggle=document.querySelector('#motion-toggle');
  const nav=document.querySelector('.nav'),progress=document.querySelector('.reading-progress');
  const worlds=[...document.querySelectorAll('.world-image-wrap')];
  const stage=document.querySelector('.aperture-scroll-stage'),destination=document.querySelector('.portal-destination');
  const portalWorlds=[...destination.querySelectorAll('.portal-world')];
  const heroCopy=document.querySelector('.launch-copy'),heroNotes=[...document.querySelectorAll('.hero-side-note,.hero-foot')];
  const clamp=v=>Math.max(0,Math.min(1,v));
  const smooth=v=>{const n=clamp(v);return n*n*(3-2*n);};
  let paused=false,visible=true,raf=0,last=0,time=0,scrollFrame=0;
  let geometryDirty=true,resizeDirty=true,push=0,sceneVisible=true;
  let geometry={mobile:false,stageTop:0,travel:1,pageEnd:1,worlds:[]};
  try{paused=localStorage.getItem('eq_motion')==='paused';}catch{}
  const enabled=()=>!paused&&!preference.matches&&!navigator.connection?.saveData;
  const active=()=>enabled()&&visible&&sceneVisible&&!document.hidden;
  function measure(){
    // Read layout together, only after resize/content changes; never in the ambient loop.
    const y=scrollY,width=art.clientWidth,height=art.clientHeight;
    geometry={mobile:innerWidth<=600,height:innerHeight,stageTop:stage.getBoundingClientRect().top+y,travel:Math.max(1,stage.offsetHeight-hero.offsetHeight),pageEnd:Math.max(1,document.documentElement.scrollHeight-innerHeight),worlds:worlds.map(el=>{const r=el.getBoundingClientRect();return {el,top:r.top+y,height:r.height};})};
    geometryDirty=false;
    if(!resizeDirty||!canvas)return;resizeDirty=false;
    // The moving light needs a small tile, not a full-screen bitmap upload every frame.
    const scale=Math.max(width/1672,height/941),dpr=Math.min(devicePixelRatio||1,innerWidth<700?1.25:1.5);
    const left=(width-1672*scale)*(innerWidth<=800?.58:.5)+(1090-220)*scale;
    const top=(height-941*scale)/2+(385-170)*scale;
    canvas.style.cssText=`left:${left}px;top:${top}px;right:auto;bottom:auto;width:${440*scale}px;height:${340*scale}px;display:${geometry.mobile?'none':'block'}`;
    canvas.width=geometry.mobile?1:Math.round(440*scale*dpr);canvas.height=geometry.mobile?1:Math.round(340*scale*dpr);canvas.dataset.dpr=String(dpr);
    paintScene();
  }
  function paintScene(){
    if(!ctx||geometry.mobile)return;ctx.clearRect(0,0,canvas.width,canvas.height);
    // Portrait composition uses restrained drift, not desktop orbital coordinates.
    const scale=canvas.width/440;
    ctx.save();ctx.scale(scale,scale);ctx.translate(220,170);ctx.rotate(-.42);
    ctx.beginPath();ctx.ellipse(0,0,186,88,0,0,Math.PI*2);ctx.strokeStyle='rgba(151,195,217,.17)';ctx.lineWidth=.7;ctx.stroke();
    const a=time*.22,px=Math.cos(a)*186,py=Math.sin(a)*88,halo=ctx.createRadialGradient(px,py,0,px,py,15);
    halo.addColorStop(0,'rgba(220,244,255,.9)');halo.addColorStop(.16,'rgba(178,224,246,.7)');halo.addColorStop(1,'rgba(126,198,229,0)');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(px,py,15,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d9edf1';ctx.beginPath();ctx.arc(px,py,2.1,0,Math.PI*2);ctx.fill();ctx.restore();canvas.dataset.frame=String(Math.round(time*30));
  }
  function paintCamera(){
    const drift=Math.sin(time*.25)*5,mobile=geometry.mobile;
    art.style.transform=`translate3d(${-push*(mobile?6:18)}vw,${drift-push*(mobile?60:20)}px,0) scale(${1+push*(mobile?1.45:1.9)}) rotate(${-push*9}deg)`;
  }
  function syncAnimation(){
    art.style.willChange=active()?'transform':'auto';
    if(!active()){cancelAnimationFrame(raf);raf=0;last=0;}else if(!raf)raf=requestAnimationFrame(frame);
  }
  function resetScene(){
    art.style.transform='';worlds.forEach(el=>el.firstElementChild.style.transform='');
    heroCopy.inert=false;heroCopy.style.opacity='';heroCopy.style.transform='';heroNotes.forEach(el=>{el.style.opacity='';});
    destination.inert=true;destination.setAttribute('aria-hidden','true');destination.classList.remove('is-entered');
  }
  function paintScroll(){
    scrollFrame=0;if(document.hidden)return;if(geometryDirty)measure();
    const y=scrollY;nav?.classList.toggle('is-scrolled',y>25);
    if(progress)progress.style.transform=`scaleX(${clamp(y/geometry.pageEnd)})`;
    if(!enabled()){
      resetScene();syncAnimation();return;
    }
    if(art&&visible){
      const p=clamp((y-geometry.stageTop)/geometry.travel);
      const reveal=smooth((p-.42)/.46),leave=smooth(p/.42),mobile=geometry.mobile;
      push=smooth(p);sceneVisible=p<.95;paintCamera();
      art.style.opacity=String(1-smooth((p-.65)/.3));
      heroCopy.style.opacity=String(1-leave);heroCopy.style.transform=`translate3d(0,${-leave*55}px,0)`;
      heroCopy.inert=p>.42;heroNotes.forEach(el=>el.style.opacity=String(1-leave));
      destination.style.opacity=String(reveal);destination.style.clipPath=`circle(${10+reveal*120}% at ${mobile?50:70}% 50%)`;
      portalWorlds.forEach((el,i)=>{el.style.transform=`scale(${1.2-.2*reveal}) translate3d(${(i?1:-1)*(1-reveal)*30}px,0,0)`;});
      const entered=p>.7;if(destination.inert===entered){destination.inert=!entered;destination.setAttribute('aria-hidden',String(!entered));destination.classList.toggle('is-entered',entered);}stage.dataset.progress=p.toFixed(3);
    }
    geometry.worlds.forEach(({el,top,height})=>{const t=top-y;if(t+height>0&&t<geometry.height){const f=Math.max(-1,Math.min(1,(t-geometry.height*.35)/geometry.height));el.firstElementChild.style.transform=innerWidth<700?'':`translate3d(0,${f*18}px,0) scale(1.08)`;}});
    syncAnimation();
  }
  function frame(now){raf=0;if(!active()){last=0;return;}if(!last)last=now;if(now-last>=1000/30){time+=Math.min((now-last)/1000,.1);last=now;paintScene();paintCamera();}raf=requestAnimationFrame(frame);}
  function schedule(){if(!scrollFrame)scrollFrame=requestAnimationFrame(paintScroll);}
  function remeasure(){geometryDirty=true;schedule();}
  function sync(){
    const on=enabled();body.classList.toggle('motion-ready',on);body.classList.toggle('motion-paused',!on);
    const label=preference.matches?'Reduced motion is on':navigator.connection?.saveData?'Data saving is on':paused?'Resume motion':'Pause motion';
    toggle.innerHTML=`<span aria-hidden="true">${on?'Ⅱ':'▷'}</span><span class="motion-label">${label}</span>`;toggle.setAttribute('aria-label',label);toggle.setAttribute('aria-pressed',String(!on));toggle.disabled=preference.matches||!!navigator.connection?.saveData;
    if(!on){ctx?.clearRect(0,0,canvas.width,canvas.height);resetScene();}syncAnimation();remeasure();
  }
  toggle.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('eq_motion',paused?'paused':'on');}catch{}sync();});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(hero);
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{resizeDirty=true;remeasure();},{passive:true});document.addEventListener('visibilitychange',sync);preference.addEventListener('change',sync);
  if('ResizeObserver'in window){const observer=new ResizeObserver(remeasure);observer.observe(body);observer.observe(stage);observer.observe(hero);}
  document.fonts?.ready.then(remeasure);addEventListener('load',remeasure,{once:true});
  const menu=document.querySelector('#mobile-navigation'),menuToggle=document.querySelector('.mobile-menu-toggle');
  function menuOpen(open,restore=false){menu.hidden=!open;menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');if(restore)menuToggle.focus();}
  menuToggle.addEventListener('click',()=>menuOpen(menu.hidden));
  menu.addEventListener('click',e=>{const link=e.target.closest('a');if(!link)return;menuOpen(false);const target=document.querySelector(link.getAttribute('href'));if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)menuOpen(false,true);});matchMedia('(min-width:1201px)').addEventListener('change',e=>{if(e.matches)menuOpen(false);});
  document.querySelectorAll('.aperture-art img,.world-image').forEach(img=>{const failed=()=>img.closest('.aperture-art,.world-image-wrap').classList.add('media-failed');img.addEventListener('error',failed);if(img.complete&&!img.naturalWidth)failed();});
  sync();
})();
