import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Store} from '../automation/store.js';
import {digest,buildCatalog,repoPages,safeMarkdown,sourceSnapshot,narrativeOf,globalPrompt} from '../automation/catalog.js';
import {WikiWorker,repoFiles,selectedModel} from '../automation/worker.js';

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
 assert.equal(f.store.job('one').state,'failed');assert.equal(f.store.job('two').state,'ready');assert.equal(f.store.batches().length,0);
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
