import fs from 'node:fs';
import path from 'node:path';

// Diagnostic-only. Call after measuring a failure, before screenshots or assertions.
// Records every element; clipped MathML/scrollbox descendants are never filtered out.
export async function captureOverflowEvidence(page, { output, name }) {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error('Unsafe overflow artifact name');
  fs.mkdirSync(output, { recursive: true });
  const filename = suffix => path.join(output, `${name}-${suffix}`);
  const settle = () => page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await settle();
  const baseline = await page.evaluate(() => {
    const rect = e => {
      const r = e.getBoundingClientRect();
      return {x:r.x,y:r.y,left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
    };
    const fields = ['display','position','overflow','overflowX','overflowY','overflowClipMargin','clip','clipPath','contain','contentVisibility','visibility','opacity','transform','transformOrigin','maskImage','width','minWidth','maxWidth','boxSizing','paddingLeft','paddingRight','marginLeft','marginRight','borderLeftWidth','borderRightWidth','fontFamily','fontSize','fontWeight','letterSpacing','lineHeight','whiteSpace','wordBreak','overflowWrap','hyphens','textWrap','textWrapMode','textWrapStyle','direction','writingMode','flex','flexShrink','gridTemplateColumns'];
    const style = e => {
      const s = getComputedStyle(e);
      return Object.fromEntries(fields.map(k => [k,s[k] ?? null]));
    };
    const elements = [document.documentElement, document.body, ...document.body.querySelectorAll('*')];
    const indexes = new Map(elements.map((e,i)=>[e,i]));
    const records = elements.map((e,i) => {
      const s = style(e);
      const r = rect(e);
      const parent = indexes.get(e.parentElement) ?? null;
      const pseudo = which => {
        const p = getComputedStyle(e, which);
        return {content:p.content,display:p.display,position:p.position,width:p.width,maxWidth:p.maxWidth,left:p.left,right:p.right,transform:p.transform,whiteSpace:p.whiteSpace};
      };
      return {index:i,parent,tag:e.tagName,namespace:e.namespaceURI,id:e.id,className:e.getAttribute('class'),text:e.textContent.trim().slice(0,160),rect:r,
        clientWidth:e.clientWidth ?? null,scrollWidth:e.scrollWidth ?? null,offsetWidth:e.offsetWidth ?? null,scrollLeft:e.scrollLeft ?? null,clientHeight:e.clientHeight ?? null,scrollHeight:e.scrollHeight ?? null,
        offsetParent:indexes.get(e.offsetParent) ?? null,style:s,before:pseudo('::before'),after:pseudo('::after'),
        rightBeyondViewport:r.width>0&&r.right>innerWidth+1,leftBeyondViewport:r.width>0&&r.left<-1,
        clippingMechanism:s.overflowX!=='visible'||s.overflowY!=='visible'||s.clip!=='auto'||s.clipPath!=='none'||/paint|strict|content/.test(s.contain)};
    });
    for (const record of records) {
      record.clippingAncestorIndexes=[];
      for(let parent=record.parent;parent!==null;parent=records[parent].parent)if(records[parent].clippingMechanism)record.clippingAncestorIndexes.push(parent);
    }
    const textRanges=[];
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    for(let node=walker.nextNode();node;node=walker.nextNode()){
      if(!node.textContent.trim())continue;
      const r=document.createRange();r.selectNodeContents(node);
      const rects=[...r.getClientRects()].map(x=>({left:x.left,right:x.right,top:x.top,bottom:x.bottom,width:x.width,height:x.height}));
      textRanges.push({parent:indexes.get(node.parentElement),text:node.textContent.trim(),rects});
    }
    const wordRanges=[];
    for(const h of document.querySelectorAll('.prose h2,.prose h3,.note-header h1')){
      const w=document.createTreeWalker(h,NodeFilter.SHOW_TEXT);
      for(let node=w.nextNode();node;node=w.nextNode())for(const m of node.textContent.matchAll(/[\p{L}\p{M}]+/gu)){
        const r=document.createRange();r.setStart(node,m.index);r.setEnd(node,m.index+m[0].length);
        wordRanges.push({heading:h.id,parent:indexes.get(h),text:m[0],rects:[...r.getClientRects()].map(x=>({left:x.left,right:x.right,top:x.top,width:x.width,height:x.height}))});
      }
    }
    const sheet = s => {
      let rules,error;
      try { rules=[...s.cssRules].map(r=>r.cssText); } catch(e) { error=String(e); }
      return {href:s.href,disabled:s.disabled,media:s.media?.mediaText,owner:s.ownerNode?.outerHTML?.slice(0,1000),rules,error};
    };
    return {url:location.href,userAgent:navigator.userAgent,platform:navigator.platform,compatMode:document.compatMode,
      viewport:{innerWidth,innerHeight,outerWidth,devicePixelRatio,scrollX,scrollY,visualViewport:visualViewport?{width:visualViewport.width,height:visualViewport.height,scale:visualViewport.scale,offsetLeft:visualViewport.offsetLeft,pageLeft:visualViewport.pageLeft}:null},
      root:{html:{clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,rect:rect(document.documentElement)},body:{clientWidth:document.body.clientWidth,scrollWidth:document.body.scrollWidth,rect:rect(document.body)},scrollingTag:document.scrollingElement?.tagName,scrollingWidth:document.scrollingElement?.scrollWidth},
      fonts:[...document.fonts].map(f=>({family:f.family,status:f.status,weight:f.weight,style:f.style})),elements:records,textRanges,wordRanges,
      stylesheets:[...document.styleSheets].map(sheet),adoptedStylesheets:[...document.adoptedStyleSheets].map(sheet)};
  });
  // Save exact current DOM and CSSOM before applying any diagnostic counterfactual.
  fs.writeFileSync(filename('document.html'), await page.content());
  const stylesheets = baseline.stylesheets;
  const adoptedStylesheets = baseline.adoptedStylesheets;
  delete baseline.stylesheets; delete baseline.adoptedStylesheets;
  fs.writeFileSync(filename('styles.json'), JSON.stringify({stylesheets,adoptedStylesheets},null,2)+'\n');
  fs.writeFileSync(filename('bounds.json'), JSON.stringify(baseline,null,2)+'\n');

  const metrics = () => page.evaluate(() => ({
    innerWidth,htmlClient:document.documentElement.clientWidth,htmlScroll:document.documentElement.scrollWidth,
    bodyClient:document.body.clientWidth,bodyScroll:document.body.scrollWidth,scrollingWidth:document.scrollingElement?.scrollWidth,scrollX,scrollY,
    regions:[...document.querySelectorAll('.site-header,main,.docs-shell,.note-header,.note-article,.prose,.prose figure,.prose table,.course-tree,.on-page,.mobile-course-nav,.mobile-on-page,.note-pagination,.site-footer')].map(e=>{
      const r=e.getBoundingClientRect(),s=getComputedStyle(e);
      return {tag:e.tagName,id:e.id,className:e.getAttribute('class'),left:r.left,right:r.right,width:r.width,clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,overflowX:s.overflowX,display:s.display};
    })
  }));
  const trials = [{name:'baseline',metrics:await metrics()}];
  const counterfactuals = {
    'remove-mathml':'.katex-mathml{display:none!important}',
    'contain-mathml':'.katex-mathml{contain:paint!important}',
    'remove-display-math':'.katex-display{display:none!important}',
    'wrap-prose-headings':'.prose h2,.prose h3{overflow-wrap:anywhere!important}',
    'hide-site-header':'.site-header,.skip-link{display:none!important}',
    'hide-note-header':'.note-header{display:none!important}',
    'hide-prose':'.prose{display:none!important}',
    'hide-figures':'.prose figure{display:none!important}',
    'hide-tables':'.prose table{display:none!important}',
    'hide-navigation':'.course-tree,.on-page,.mobile-course-nav,.mobile-on-page{display:none!important}',
    'hide-pagination':'.note-pagination{display:none!important}',
    'hide-footer':'.site-footer{display:none!important}',
    'hide-practice':'.biased-practice{display:none!important}',
    'wrap-body-text':'body{overflow-wrap:anywhere!important}',
  };
  for(const [name,css] of Object.entries(counterfactuals)){
    let handle;
    try { handle=await page.addStyleTag({content:css});await settle();trials.push({name,css,metrics:await metrics()}); }
    catch(error){trials.push({name,css,error:String(error)});}
    finally { if(handle)await handle.evaluate(e=>e.remove());await settle(); }
  }
  // Test actual reachable horizontal scrolling separately, then restore the original position.
  const scroll = await page.evaluate(async () => {
    const original={x:scrollX,y:scrollY};
    window.scrollTo({left:1000000,top:original.y,behavior:'instant'});
    await new Promise(resolve=>requestAnimationFrame(resolve));
    const reached={x:scrollX,y:scrollY};
    window.scrollTo({left:original.x,top:original.y,behavior:'instant'});
    return {original,reached};
  });
  await settle();
  const restored=await metrics();
  fs.writeFileSync(filename('counterfactuals.json'),JSON.stringify({trials,scroll,restored},null,2)+'\n');
  return {files:['document.html','styles.json','bounds.json','counterfactuals.json'].map(s=>`${name}-${s}`),
    originalRoot:baseline.root,restoredHtmlScroll:restored.htmlScroll,trialWidths:trials.map(t=>({name:t.name,htmlScroll:t.metrics?.htmlScroll,error:t.error}))};
}
