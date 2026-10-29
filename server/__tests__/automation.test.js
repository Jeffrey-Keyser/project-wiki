import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Store} from '../automation/store.js';
import {digest,buildCatalog,repoPages,safeMarkdown,sourceSnapshot,narrativeOf,globalPrompt} from '../automation/catalog.js';
import {WikiWorker,repoFiles,selectedModel,REPOSITORY_GUIDES_BYTE_LIMIT,parseBatchJson} from '../automation/worker.js';

function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'wiki-worker-test-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(name,value)=>{fs.mkdirSync(path.dirname(path.join(root,name)),{recursive:true});fs.writeFileSync(path.join(root,name),value);};
 write('.wiki-config.json',JSON.stringify({allowlist:['Owner/Repo']}));
 const content='---\ntitle: Test\n---\n\n## Architecture\n\n'+('Source-supported documentation. '.repeat(20));
 for(const file of ['Home.md','Architecture.md','Iteration-Loop.md','Services-and-Dependencies.md','Operations.md','Glossary.md'])write('content/repos/Owner-Repo/'+file,content);
 write('content/repos/Repo/Home.md','Legacy alias content');
 const original='---\ntitle: Ecosystem\n---\n\n'+('Evidence-grounded architecture. '.repeat(90))+'\n<!-- curated:start -->Keep this exact.<!-- curated:end -->\n\n'+['graph TD\n A-->B','graph TD\n C-->D','graph TD\n E-->F'].map(x=>'```mermaid\n'+x+'\n```').join('\n\n');
 write('content/ecosystem/overview.md',original+'\n\n## Repository and wiki directory\n\nOld directory\n\n## Sources and coverage\n\nSources.\n');
 write('content/ecosystem/catalog.json',JSON.stringify({version:1,repositories:[]}));
 write('content/index.md','---\ntitle: Home\n---\n\n| Repository | Guide | Source |\n| --- | --- | --- |\n');
 const registry='Repo: https://github.com/Owner/Repo\n'+('Documentation platform source. '.repeat(10));
 const fetcher=async url=>({ok:true,json:async()=>({data:{value:url.includes('ecosystem')?registry:'Host reference. '.repeat(30)}})});
 const store=new Store(path.join(root,'state/worker.sqlite'));t.after(()=>store.close());
 const publications=[];
 const publisher={checkout:root,ensure:async()=>{},sync:async()=>root,recover:async()=>null,publish:async(files,jobs=[])=>{publications.push({files,jobs});for(const [name,value]of Object.entries(files))write(name,value);return{sha:'a'.repeat(40),jobs};}};
 const env={WIKI_BATCH_UNTIL:'2099-01-01T00:00:00Z',WIKI_COALESCE_MS:'0'};
 return{root,write,store,publisher,publications,fetcher,env,original};
}
test('catalog prefers canonical pages and includes registry repositories without guides',t=>{
 const f=fixture(t);const c=buildCatalog(f.root,'Repo: https://github.com/Owner/Repo\nService\nOther: https://github.com/Owner/Other\nNot yet built\n',{repositories:[]});
 assert.equal(c.repositories.length,3);assert.equal(c.repositories.find(x=>x.repo==='Owner/Repo').pages.length,6);
 assert.ok(c.repositories.find(x=>x.repo==='Owner/Repo').pages[0].url.includes('owner-repo'));
 assert.equal(c.repositories.find(x=>x.repo==='Owner/Other').state,'planned');
});
test('additional repository guides are discovered safely and retain standard guide completeness',t=>{
 const f=fixture(t);
 for(const name of ['Projects-Guide','Reconciliation-Lifecycle','Requirements-and-Acceptance','Projects-Troubleshooting'])f.write(`content/repos/Owner-Repo/${name}.md`,'---\ntitle: Guide\n---\n\nGuide content.');
 for(const name of ['.hidden.md','_draft.md','bad name.md','Other.mdx','nested/Nested.md'])f.write('content/repos/Owner-Repo/'+name,'Not a refresh guide');
 f.write('outside.md','Must not be read through a symlink');
 fs.symlinkSync(path.join(f.root,'outside.md'),path.join(f.root,'content/repos/Owner-Repo/Outside.md'));
 const pages=repoPages(f.root,'Owner/Repo');
 assert.deepEqual(pages.map(p=>p.slug),['home','architecture','iteration-loop','services-and-dependencies','operations','glossary','projects-guide','projects-troubleshooting','reconciliation-lifecycle','requirements-and-acceptance']);
 assert.equal(pages[6].label,'Projects Guide');
 assert.equal(pages[9].url,'/repos/owner-repo/requirements-and-acceptance/');
 const catalog=()=>buildCatalog(f.root,'Repo: https://github.com/Owner/Repo\nService\n',{repositories:[]}).repositories.find(r=>r.repo==='Owner/Repo');
 assert.equal(catalog().pages.length,10);assert.equal(catalog().fullGuide,true);
 fs.unlinkSync(path.join(f.root,'content/repos/Owner-Repo/Glossary.md'));
 assert.equal(catalog().fullGuide,false);
});
test('duplicate case-insensitive repository guide slugs fail closed',t=>{
 const f=fixture(t);f.write('content/repos/Owner-Repo/home.md','Ambiguous duplicate');
 assert.throws(()=>repoPages(f.root,'Owner/Repo'),/duplicate-guide-slug/);
});
test('repository batch prompts and guards include all additional guides beyond the legacy prompt cap',async t=>{
 const f=fixture(t),extra=['Projects-Guide','Projects-Troubleshooting','Reconciliation-Lifecycle','Requirements-and-Acceptance'];
 const content='---\ntitle: Guide\n---\n\n## Architecture\n\n'+'Source-supported content. '.repeat(500);
 for(const page of repoPages(f.root,'Owner/Repo'))f.write(page.relativePath,content);
 for(const name of extra)f.write(`content/repos/Owner-Repo/${name}.md`,content+`\nComplete ending for ${name}.\n`);
 f.store.event('Owner/Repo',{sha:'b'.repeat(40),title:'Requirements behavior changed',files:[{path:'src/requirements.ts'}]},1);
 const worker=new WikiWorker({...f,env:{...f.env,PROJECT_WIKI_MODEL_SOURCE:'env',PROJECT_WIKI_GENERATOR_PROVIDER:'claude',PROJECT_WIKI_GENERATOR_MODEL:'haiku'},client:{},sourceDiff:async()=>({label:'old..new',patch:'diff --git a/src/requirements.ts b/src/requirements.ts\n+new behavior',stat:'src/requirements.ts | 1 +'} )});
 worker.head=async()=> 'b'.repeat(40);
 await worker.prepareRepo(f.store.events()[0]);
 const job=f.store.jobs(['queued'])[0],pages=repoPages(f.root,'Owner/Repo'),prompt=job.params.messages.at(-1).content;
 assert.ok(Buffer.byteLength(prompt)>50*1024);
 assert.ok(prompt.includes(`bounded to ${REPOSITORY_GUIDES_BYTE_LIMIT} bytes`));
 for(const name of extra){assert.ok(prompt.includes('## '+name+'.md'));assert.ok(prompt.includes('Complete ending for '+name+'.'));}
 assert.ok(!prompt.includes('[truncated]'));
 const output=JSON.stringify({pages:pages.filter(p=>extra.some(name=>name.toLowerCase()===p.slug)).map(p=>({page_slug:p.slug,content:p.content+'\nUpdated from the source diff.\n'}))});
 assert.equal(Object.keys(repoFiles(job,pages,output)).length,4);
 f.write('content/repos/Owner-Repo/Projects-Guide.md',content+'Concurrent owner edit.');
 assert.throws(()=>repoFiles(job,repoPages(f.root,'Owner/Repo'),output),/stale-document-base/);
});
test('oversized repository guides stay pending without source fetches or model jobs',async t=>{
 const f=fixture(t);f.write('content/repos/Owner-Repo/Projects-Guide.md','x'.repeat(REPOSITORY_GUIDES_BYTE_LIMIT));
 f.store.event('Owner/Repo',{sha:'b'.repeat(40),files:[]},1);
 let fetched=false;
 const worker=new WikiWorker({...f,client:{},sourceDiff:async()=>{fetched=true;}});
 await assert.rejects(worker.prepareRepo(f.store.events()[0]),/repository-guides-exceed-context-budget/);
 assert.equal(fetched,false);assert.equal(f.store.jobs(['queued']).length,0);assert.equal(f.store.events().length,1);
});
test('source hashing excludes generated global/home output and detects changed guide input',async t=>{
 const f=fixture(t);const a=await sourceSnapshot(f.root,f.fetcher);
 f.write('content/index.md','Generated output changes');f.write('content/ecosystem/overview.md','Generated output changes');
 assert.equal((await sourceSnapshot(f.root,f.fetcher)).hash,a.hash);
 f.write('content/repos/Owner-Repo/Architecture.md','New architecture');
 assert.notEqual((await sourceSnapshot(f.root,f.fetcher)).hash,a.hash);
});
test('durable coalescing preserves first dirty time and compare-and-delete protects newer events',t=>{
 const f=fixture(t);f.store.event('Owner/Repo',{sha:'one'},100);f.store.event('Owner/Repo',{sha:'two'},200);
 assert.equal(f.store.events()[0].dirty_at,100);f.store.clearEvent('Owner/Repo',1);assert.equal(f.store.events().length,1);
 const second=new Store(path.join(f.root,'state/worker.sqlite'));assert.equal(second.events()[0].data.sha,'two');second.close();
 f.store.clearEvent('Owner/Repo',2);assert.equal(f.store.events().length,0);
});
test('submission retries reuse durable request after an uncertain client response',async t=>{
 const f=fixture(t);let calls=[];
 const worker=new WikiWorker({...f,client:{submit:async body=>{calls.push(body);if(calls.length===1)throw Error('network lost');return{id:'remote',state:'in_progress'};}}});
 f.store.add({id:'j1',kind:'repo',params:{model:'claude-haiku-5-5'}});
 await assert.rejects(worker.submit());assert.equal(f.store.batches()[0].state,'submitting');
 const restarted=new WikiWorker({...f,client:worker.client});await restarted.submit();
 assert.deepEqual(calls[0],calls[1]);assert.equal(f.store.job('j1').state,'submitted');
});
test('unordered partial results survive restart and never apply truncated output',async t=>{
 const f=fixture(t);for(const id of ['one','two'])f.store.add({id,kind:'repo',state:'submitted',batch:'batch'});
 f.store.saveBatch({id:'batch',remoteId:'remote',state:'submitted',jobs:['one','two']});
 const result=(id,finish='stop')=>({custom_id:id,status:'succeeded',response:{choices:[{finish_reason:finish,message:{content:'{"pages":[]}'}}]},estimated_cost_usd:0.01});
 const worker=new WikiWorker({...f,client:{results:async()=>({state:'in_progress',results:[result('two')]})}});await worker.poll();
 assert.equal(f.store.job('two').state,'ready');assert.equal(f.store.job('one').state,'submitted');
 worker.client={results:async()=>({state:'ended',results:[result('one','length'),result('two')]})};await worker.poll();
 assert.equal(f.store.job('one').state,'failed');assert.equal(f.store.job('one').error,'model-output-token-limit');assert.equal(f.store.job('two').state,'ready');assert.equal(f.store.batches().length,0);
});
test('batch JSON accepts a whole-response fence but rejects ambiguous approvals and invalid shapes',()=>{
 assert.deepEqual(parseBatchJson(' {"approved":true} '),{approved:true});
 assert.deepEqual(parseBatchJson('```json\n{"approved":false,"reason":"Evidence missing"}\n```'),{approved:false,reason:'Evidence missing'});
 assert.deepEqual(parseBatchJson('```\r\n{"approved":true}\r\n```'),{approved:true});
 assert.throws(()=>parseBatchJson('Denied.\n```json\n{"approved":true}\n```'),/invalid-result-json/);
 assert.throws(()=>parseBatchJson('{"approved":false}\n{"approved":true}'),/invalid-result-json/);
 for(const raw of ['[]','null','true','"approved"'])assert.throws(()=>parseBatchJson(raw),/invalid-result-shape/);
});
test('fenced global drafts retain validation and the independent review boundary',async t=>{
 const f=fixture(t),snapshot=await sourceSnapshot(f.root,f.fetcher),catalog=buildCatalog(f.root,'Repo: https://github.com/Owner/Repo\nService\n',{repositories:[]});
 const worker=new WikiWorker({...f,client:{}});await worker.prepareGlobal(snapshot,catalog);
 const job=f.store.jobs(['queued'])[0];
 assert.equal(job.params.reasoning_effort,'low');assert.equal(job.params.max_tokens,24000);assert.equal(job.generationPolicy,'low-effort-json-v1');
 await worker.prepareGlobal(snapshot,catalog);assert.equal(f.store.jobs(['queued']).length,1);
 f.store.patch(job.id,{state:'submitted',batch:'global-batch'});f.store.saveBatch({id:'global-batch',remoteId:'remote',state:'submitted',jobs:[job.id]});
 const response=(content)=>({state:'ended',results:[{custom_id:job.id,status:'succeeded',response:{choices:[{finish_reason:'stop',message:{content}}]}}]});
 worker.client={results:async()=>response('```json\n'+JSON.stringify({markdown:f.original,catalogCorrections:[]})+'\n```')};
 await worker.poll();assert.equal(f.store.job(job.id).state,'awaiting_review');assert.equal(f.publications.length,0);
 const review=f.store.jobs(['queued'])[0];f.store.patch(review.id,{state:'submitted',batch:'review-batch'});f.store.saveBatch({id:'review-batch',remoteId:'review',state:'submitted',jobs:[review.id]});
 worker.client={results:async()=>({state:'ended',results:[{custom_id:review.id,status:'succeeded',response:{choices:[{finish_reason:'stop',message:{content:'```json\n{"approved":false,"reason":"SECRET PROVIDER TEXT"}\n```'}}]}}]})};
 await worker.poll();assert.equal(f.store.job(review.id).error,'opus-review-rejected');assert.equal(f.store.job(job.id).error,'opus-review-rejected');assert.equal(f.store.job(job.id).state,'failed');
 assert.equal(f.store.get('last-result-error').code,'opus-review-rejected');assert.ok(!JSON.stringify(f.store.get('last-result-error')).includes('SECRET'));assert.equal(f.publications.length,0);
 await worker.prepareGlobal(snapshot,catalog);assert.equal(f.store.jobs(['queued']).length,0);assert.equal(f.store.job(job.id).state,'failed');
});
test('fenced reviewer approval advances only its reviewed parent',async t=>{
 const f=fixture(t);f.store.add({id:'parent',kind:'global',state:'awaiting_review'});f.store.add({id:'review',kind:'review',parent:'parent',state:'submitted',batch:'b'});f.store.saveBatch({id:'b',remoteId:'remote',state:'submitted',jobs:['review']});
 const worker=new WikiWorker({...f,client:{results:async()=>({state:'ended',results:[{custom_id:'review',status:'succeeded',response:{choices:[{finish_reason:'stop',message:{content:'```json\n{"approved":true}\n```'}}]}}]})}});
 await worker.poll();assert.equal(f.store.job('parent').state,'ready');assert.equal(f.store.job('review').state,'completed');assert.equal(f.publications.length,0);
});
test('global result failures retain stable diagnostics without storing raw output',async t=>{
 const f=fixture(t);
 const cases=[['truncated','length','{"markdown":"partial','model-output-token-limit'],['empty','stop',' ','empty-model-output'],['malformed','stop','SECRET PROVIDER TEXT','invalid-result-json'],['shape','stop','{"markdown":42}','invalid-global-result-shape'],['diagram','stop',JSON.stringify({markdown:f.original.replace('```mermaid','```text')}),'global-diagram-count'],['curated','stop',JSON.stringify({markdown:f.original.replace('Keep this exact.','Changed.')}),'curated-content-changed']];
 for(const [id]of cases)f.store.add({id,kind:'global',original:f.original,state:'submitted',batch:'b'});
 f.store.saveBatch({id:'b',remoteId:'remote',state:'submitted',jobs:cases.map(([id])=>id)});
 const worker=new WikiWorker({...f,client:{results:async()=>({state:'ended',results:cases.map(([id,finish,content])=>({custom_id:id,status:'succeeded',response:{choices:[{finish_reason:finish,message:{content}}]}}))})}});
 await worker.poll();
 for(const [id,,,code]of cases){assert.equal(f.store.job(id).error,code);assert.ok(!f.store.job(id).output);}
 assert.ok(!JSON.stringify(f.store.get('last-result-error')).includes('SECRET'));assert.equal(f.publications.length,0);
});
test('repository guards reject stale docs, unknown pages, active content, and curated edits',t=>{
 const f=fixture(t),pages=repoPages(f.root,'Owner/Repo'),job={repo:'Owner/Repo',docsHash:digest(pages.map(p=>[p.relativePath,p.content]))};
 const generated={pages:[{page_slug:'architecture',content:pages[1].content+'\nNew source detail.'}]};
 assert.equal(Object.keys(repoFiles(job,pages,JSON.stringify(generated))).length,1);
 assert.throws(()=>repoFiles({...job,docsHash:'old'},pages,JSON.stringify(generated)),/stale/);
 assert.throws(()=>repoFiles(job,pages,JSON.stringify({pages:[{page_slug:'invented',content:pages[0].content}]})),/invalid/);
 assert.throws(()=>safeMarkdown('```mermaid\ngraph TD\n click A "javascript:alert(1)"\n```'),/active/);
 assert.throws(()=>safeMarkdown('<iframe src="https://evil.example"></iframe>'),/active/);
});
test('structural global draft requires an approved Opus review before publication',async t=>{
 const f=fixture(t),snapshot=await sourceSnapshot(f.root,f.fetcher),catalog=buildCatalog(f.root,('Repo: https://github.com/Owner/Repo\nService\n'),{repositories:[]});
 const worker=new WikiWorker({...f,client:{}});await worker.prepareGlobal(snapshot,catalog);
 const job=f.store.jobs(['queued'])[0];assert.equal(job.params.model,'claude-haiku-5-5');assert.equal(job.structural,true);
 f.store.patch(job.id,{state:'submitted',batch:'batch'});f.store.saveBatch({id:'batch',remoteId:'remote',state:'submitted',jobs:[job.id]});
 worker.client={results:async()=>({state:'ended',results:[{custom_id:job.id,status:'succeeded',response:{choices:[{finish_reason:'stop',message:{content:JSON.stringify({markdown:f.original,catalogCorrections:[]})}}]}}]})};
 await worker.poll();assert.equal(f.store.job(job.id).state,'awaiting_review');
 const review=f.store.jobs(['queued'])[0];assert.equal(review.params.model,'claude-opus-5-5');assert.equal(f.publications.length,0);
 f.store.patch(review.id,{state:'submitted',batch:'reviewbatch'});f.store.saveBatch({id:'reviewbatch',remoteId:'reviewremote',state:'submitted',jobs:[review.id]});
 worker.client={results:async()=>({state:'ended',results:[{custom_id:review.id,status:'succeeded',response:{choices:[{finish_reason:'stop',message:{content:'{"approved":true}'}}]}}]})};
 await worker.poll();assert.equal(f.store.job(job.id).state,'ready');
});
test('free directory refresh continues when proxy polling and admission fail',async t=>{
 const f=fixture(t);f.store.saveBatch({id:'old',state:'submitted',remoteId:'remote',jobs:[]});
 const worker=new WikiWorker({...f,client:{results:async()=>{throw Error('offline');},submit:async()=>{throw Object.assign(Error('quota'),{code:'BATCH_BUDGET_EXHAUSTED'});}}});
 await worker.tick();assert.equal(f.publications.length,1);assert.equal(f.store.get('last-source-check').repositories,2);
 assert.equal(f.store.get('poll-error').code,'proxy-poll-failed');assert.ok(f.store.get('last-successful-tick'));
});
test('batch selection uses Haiku or Opus only',()=>{
 assert.equal(selectedModel({provider:'claude',model:'haiku'}),'claude-haiku-5-5');
 assert.equal(selectedModel({provider:'claude',model:'opus'}),'claude-opus-5-5');
 assert.throws(()=>selectedModel({provider:'codex',model:'gpt-6'}));assert.throws(()=>selectedModel({provider:'claude',model:'sonnet'}));
});
test('busy source repositories publish their valid snapshot and retain a catch-up event',async t=>{
 const f=fixture(t),pages=repoPages(f.root,'Owner/Repo');
 f.store.event('Owner/Repo',{sha:'a'.repeat(40),files:[]},1);
 f.store.add({id:'busy',kind:'repo',repo:'Owner/Repo',head:'a'.repeat(40),docsHash:digest(pages.map(p=>[p.relativePath,p.content])),eventSeq:1,state:'ready',output:'{"pages":[]}'});
 const worker=new WikiWorker({...f,client:{}});worker.head=async()=> 'b'.repeat(40);worker.ancestor=async()=>true;
 await worker.apply();assert.equal(f.store.job('busy').state,'completed');
 assert.equal(f.store.get('repo:Owner/Repo').head,'a'.repeat(40));assert.equal(f.store.events()[0].data.sha,'b'.repeat(40));
});
test('manual narrative changes invalidate ready global output without touching the page',async t=>{
 const f=fixture(t),snapshot=await sourceSnapshot(f.root,f.fetcher),catalog=buildCatalog(f.root,'Repo: https://github.com/Owner/Repo\nService\n',{repositories:[]});
 f.write('content/ecosystem/catalog.json',JSON.stringify(catalog));
 const worker=new WikiWorker({...f,client:{}});await worker.prepareGlobal(snapshot,catalog);
 const job=f.store.jobs(['queued'])[0];f.store.patch(job.id,{state:'ready',draft:{markdown:f.original,catalogCorrections:[]}});
 const changed=f.original.replace('Evidence-grounded','Human-edited');f.write('content/ecosystem/overview.md',changed+'\n\n## Repository and wiki directory\n\n## Sources and coverage\n');
 await worker.apply();assert.equal(f.store.job(job.id).state,'stale');assert.equal(f.publications.length,0);
 assert.ok(fs.readFileSync(path.join(f.root,'content/ecosystem/overview.md'),'utf8').includes('Human-edited'));
});
test('guide changes during a global batch remain dirty after its older snapshot is published',async t=>{
 const f=fixture(t),snapshot=await sourceSnapshot(f.root,f.fetcher),catalog=buildCatalog(f.root,'Repo: https://github.com/Owner/Repo\nService\n',{repositories:[]});
 f.write('content/ecosystem/catalog.json',JSON.stringify(catalog));
 const worker=new WikiWorker({...f,client:{submit:async()=>{throw Error('offline');}}});await worker.prepareGlobal(snapshot,catalog);
 const job=f.store.jobs(['queued'])[0];f.store.patch(job.id,{state:'ready',draft:{markdown:f.original,catalogCorrections:[]}});
 f.write('content/repos/Owner-Repo/Architecture.md','Updated guide while the batch ran.');
 const newer=await sourceSnapshot(f.root,f.fetcher);f.store.set('observed-sources',newer);
 await worker.apply();assert.equal(f.store.job(job.id).state,'completed');assert.equal(f.store.get('global-checkpoint').sources['content/repos/Owner-Repo/Architecture.md'],snapshot.sources['content/repos/Owner-Repo/Architecture.md']);
 await worker.tick();const next=f.store.jobs(['queued']);assert.equal(next.length,1);assert.notEqual(next[0].id,job.id);assert.equal(next[0].snapshot.hash,newer.hash);
});
