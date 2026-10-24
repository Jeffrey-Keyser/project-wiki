import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
export async function command(bin,args,cwd,options={}){const result=await exec(bin,args,{cwd,maxBuffer:8*1024*1024,timeout:10*60_000,...options});return result.stdout.trim();}
const sha256=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export function checkRendered(checkout,files){
 const dist=path.join(checkout,'dist');const targets=new Set(['content/index.md','content/ecosystem/overview.md',...files.filter(p=>p.endsWith('.md'))]);let links=0;
 for(const file of targets){
  const route=file.replace(/^content\//,'').replace(/\.md$/,'').toLowerCase();
  const url=route==='index'?'/':`/${route}/`;const htmlPath=path.join(dist,url,'index.html');
  const html=fs.readFileSync(htmlPath,'utf8');
  for(const m of html.matchAll(/<a\b[^>]*\bhref=(["'])(.*?)\1/g)){
   const href=m[2].replace(/&amp;/g,'&');const u=new URL(href,'https://wiki.jeffreykeyser.net'+url);
   if(u.hostname!=='wiki.jeffreykeyser.net')continue;
   if(!['https:','http:'].includes(u.protocol))throw Error('invalid-link-protocol');
   let dest=path.join(dist,decodeURIComponent(u.pathname));
   if(u.pathname.endsWith('/'))dest=path.join(dest,'index.html');else if(!fs.existsSync(dest)&&!path.extname(dest))dest=path.join(dest,'index.html');
   if(!dest.startsWith(dist+path.sep)||!fs.existsSync(dest))throw Error('broken-internal-link');
   if(u.hash&&dest.endsWith('.html')){
    const id=decodeURIComponent(u.hash.slice(1));const target=fs.readFileSync(dest,'utf8');
    if(![...target.matchAll(/\bid=(["'])(.*?)\1/g)].some(x=>x[2]===id))throw Error('broken-internal-anchor');
   }
   links++;
  }
 }
 for(const name of ['topology','events','delivery']){
  const svg=fs.readFileSync(path.join(dist,'diagrams',`ecosystem-${name}.svg`),'utf8');if(!svg.includes('<svg')||/<script\b|\bonload\s*=/i.test(svg))throw Error('invalid-exported-diagram');
 }
 return links;
}
export class Publisher{
 constructor({checkout,artifacts,remote='git@github.com:Jeffrey-Keyser/project-wiki.git',host='beelink',remoteRoot='/home/jkeyser/project-wiki',store}){
  Object.assign(this,{checkout,artifacts,remote,host,remoteRoot,store});
  if(!/^[A-Za-z0-9_.-]+$/.test(host)||!/^\/[A-Za-z0-9_./-]+$/.test(remoteRoot))throw Error('invalid-publication-host');
 }
 async ensure(){
  if(!fs.existsSync(this.checkout)){
   fs.mkdirSync(path.dirname(this.checkout),{recursive:true,mode:0o700});await command('git',['clone','--quiet',this.remote,this.checkout]);fs.writeFileSync(path.join(this.checkout,'.git/wiki-worker-owned'),'owned\n');
  }
  if(!fs.existsSync(path.join(this.checkout,'.git/wiki-worker-owned')))throw Error('refusing-unowned-checkout');
  fs.mkdirSync(this.artifacts,{recursive:true,mode:0o700});
 }
 async sync(){await this.ensure();await command('git',['fetch','--quiet','origin','main'],this.checkout);await command('git',['reset','--hard','origin/main'],this.checkout);return this.checkout;}
 async recover(){
  const intent=this.store.get('publish-intent');if(!intent)return null;
  const current=await command('git',['ls-remote','origin','refs/heads/main'],this.checkout);
  const remote=current.split(/\s/)[0];
  if(remote!==intent.parent&&remote!==intent.sha){this.store.set('publish-intent',null);return {superseded:true,jobs:intent.jobs};}
  if(remote!==intent.sha)await command('git',['push','origin',`${intent.sha}:refs/heads/main`],this.checkout);
  const remoteCache=`/home/jkeyser/.cache/project-wiki/artifacts/${intent.sha}`;
  await command('ssh',[this.host,`mkdir -p ${remoteCache}`],this.checkout);
  await command('scp',[intent.archive,intent.manifest,`${this.host}:${remoteCache}/`],this.checkout);
  const result=JSON.parse(await command('ssh',[this.host,`${this.remoteRoot}/scripts/install-wiki-artifact.sh ${intent.sha}`],this.checkout));
  if(result.status==='stale-main'){this.store.set('publish-intent',null);return {superseded:true,jobs:intent.jobs};}
  if(!['published','already-published'].includes(result.status))throw Error('publication-not-confirmed');
  // The worker clears the intent only after recording job checkpoints. A
  // crash between artifact installation and completion remains recoverable.
  return {sha:intent.sha,jobs:intent.jobs};
 }
 async publish(files,jobs=[]){
  const changed=[];
  for(const [name,content] of Object.entries(files)){
   if(!/^content\/[A-Za-z0-9_./-]+\.(md|json)$/.test(name)||name.split('/').includes('..'))throw Error('invalid-publish-path');
   const dest=path.join(this.checkout,name);if(fs.existsSync(dest)&&fs.readFileSync(dest,'utf8')===content)continue;
   fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,content);changed.push(name);
  }
  if(!changed.length)return {sha:await command('git',['rev-parse','HEAD'],this.checkout),jobs};
  const lock=sha256(path.join(this.checkout,'package-lock.json'));
  if(this.store.get('dependencies-lock')!==lock||!fs.existsSync(path.join(this.checkout,'node_modules/.bin/astro'))){
   await command('npm',['ci','--omit=dev','--ignore-scripts','--no-audit','--no-fund'],this.checkout);this.store.set('dependencies-lock',lock);
  }
  const build=await command('npm',['run','build'],this.checkout);
  if(build.includes('[ERROR]')||build.includes('Error rendering'))throw Error('wiki-render-failed');
  const links=checkRendered(this.checkout,changed);
  const parent=await command('git',['rev-parse','HEAD'],this.checkout);
  await command('git',['add','--',...changed],this.checkout);
  await command('git',['-c','user.name=Project Wiki','-c','user.email=Jeffrey-Keyser@users.noreply.github.com','commit','-m',`wiki: refresh ${jobs.length?'batch documentation':'ecosystem directory'}`],this.checkout);
  const sha=await command('git',['rev-parse','HEAD'],this.checkout);const dir=path.join(this.artifacts,sha);fs.mkdirSync(dir,{recursive:true});
  const archive=path.join(dir,'site.tar.gz'),manifest=path.join(dir,'manifest.json');await command('tar',['-czf',archive,'dist'],this.checkout);
  fs.writeFileSync(manifest,JSON.stringify({revision:sha,archiveSha256:sha256(archive),links,changedFiles:changed,createdAt:new Date().toISOString()}));
  this.store.set('publish-intent',{sha,parent,archive,manifest,jobs});
  return this.recover();
 }
}
