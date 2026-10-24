import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

test('production installer checks hashes and main, swaps a complete artifact, and replays safely',t=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'wiki-installer-test-'));t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
 const root=path.join(temp,'repo'),remote=path.join(temp,'remote.git'),home=path.join(temp,'home'),bin=path.join(temp,'bin');
 for(const p of [root,home,bin])fs.mkdirSync(p,{recursive:true});
 const run=(cmd,args,cwd=root,env=process.env)=>execFileSync(cmd,args,{cwd,env,stdio:['ignore','pipe','pipe']}).toString().trim();
 run('git',['init','--quiet','--bare',remote]);run('git',['init','--quiet','-b','main']);run('git',['config','user.name','Test']);run('git',['config','user.email','test@example.com']);
 fs.mkdirSync(path.join(root,'scripts'));fs.copyFileSync(new URL('../../scripts/install-wiki-artifact.sh',import.meta.url),path.join(root,'scripts/install-wiki-artifact.sh'));
 fs.writeFileSync(path.join(root,'README.md'),'Initial source');run('git',['add','.']);run('git',['commit','--quiet','-m','initial']);run('git',['remote','add','origin',remote]);run('git',['push','--quiet','origin','main']);
 const sha=run('git',['rev-parse','HEAD']);
 fs.mkdirSync(path.join(root,'dist'));fs.writeFileSync(path.join(root,'dist/index.html'),'Old published site');
 fs.writeFileSync(path.join(bin,'systemctl'),'#!/bin/sh\nexit 0\n',{mode:0o755});
 const env={...process.env,HOME:home,PATH:bin+':'+process.env.PATH};
 const cache=path.join(home,'.cache/project-wiki/artifacts',sha);fs.mkdirSync(cache,{recursive:true});
 const stage=path.join(temp,'stage');fs.mkdirSync(path.join(stage,'dist/ecosystem/overview'),{recursive:true});fs.writeFileSync(path.join(stage,'dist/index.html'),'New validated site');fs.writeFileSync(path.join(stage,'dist/ecosystem/overview/index.html'),'New map');
 run('tar',['-czf',path.join(cache,'site.tar.gz'),'dist'],stage);
 const manifest={revision:sha,archiveSha256:'wrong'};const save=()=>fs.writeFileSync(path.join(cache,'manifest.json'),JSON.stringify(manifest));save();
 assert.throws(()=>run('bash',['scripts/install-wiki-artifact.sh',sha],root,env));assert.equal(fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),'Old published site');
 manifest.archiveSha256=crypto.createHash('sha256').update(fs.readFileSync(path.join(cache,'site.tar.gz'))).digest('hex');save();
 assert.equal(JSON.parse(run('bash',['scripts/install-wiki-artifact.sh',sha],root,env)).status,'published');assert.equal(fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),'New validated site');
 assert.equal(JSON.parse(run('bash',['scripts/install-wiki-artifact.sh',sha],root,env)).status,'already-published');
 assert.equal(JSON.parse(run('bash',['scripts/install-wiki-artifact.sh','b'.repeat(40)],root,env)).status,'stale-main');
 // A signed/hash-matched archive must still reject traversal and symlinks.
 fs.rmSync(path.join(root,'.wiki-artifact-state.json'));fs.symlinkSync('/etc/passwd',path.join(stage,'dist/unsafe'));
 run('tar',['-czf',path.join(cache,'site.tar.gz'),'dist'],stage);manifest.archiveSha256=crypto.createHash('sha256').update(fs.readFileSync(path.join(cache,'site.tar.gz'))).digest('hex');save();
 assert.throws(()=>run('bash',['scripts/install-wiki-artifact.sh',sha],root,env));assert.equal(fs.existsSync(path.join(root,'dist/unsafe')),false);
});
