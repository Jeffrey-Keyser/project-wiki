import fs from 'node:fs';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
export class Store{
 constructor(file){fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});this.db=new DatabaseSync(file);fs.chmodSync(file,0o600);this.db.exec(`PRAGMA journal_mode=WAL;PRAGMA synchronous=FULL;PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS events(repo TEXT PRIMARY KEY,data TEXT NOT NULL,seq INTEGER NOT NULL,dirty_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,data TEXT NOT NULL,state TEXT NOT NULL,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS batches(id TEXT PRIMARY KEY,data TEXT NOT NULL,state TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS state(key TEXT PRIMARY KEY,data TEXT NOT NULL);`);}
 close(){this.db.close();}
 get(key,fallback=null){const r=this.db.prepare('SELECT data FROM state WHERE key=?').get(key);return r?JSON.parse(r.data):fallback;}
 set(key,value){this.db.prepare('INSERT INTO state VALUES(?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data').run(key,JSON.stringify(value));}
 event(repo,data,now=Date.now()){
  const old=this.db.prepare('SELECT * FROM events WHERE repo=?').get(repo);
  if(old&&JSON.parse(old.data).sha===data.sha)return;
  this.db.prepare('INSERT INTO events VALUES(?,?,1,?) ON CONFLICT(repo) DO UPDATE SET data=excluded.data,seq=events.seq+1').run(repo,JSON.stringify(data),now);
 }
 events(){return this.db.prepare('SELECT * FROM events ORDER BY dirty_at').all().map(r=>({...r,data:JSON.parse(r.data)}));}
 clearEvent(repo,seq){this.db.prepare('DELETE FROM events WHERE repo=? AND seq=?').run(repo,seq);}
 job(id){const r=this.db.prepare('SELECT data,state FROM jobs WHERE id=?').get(id);return r?{...JSON.parse(r.data),state:r.state}:null;}
 add(job){this.db.prepare('INSERT OR IGNORE INTO jobs VALUES(?,?,?,?)').run(job.id,JSON.stringify(job),job.state??'queued',Date.now());return this.job(job.id);}
 patch(id,patch){const current=this.job(id);if(!current)throw Error('job-missing');const value={...current,...patch};this.db.prepare('UPDATE jobs SET data=?,state=? WHERE id=?').run(JSON.stringify(value),value.state,id);return value;}
 jobs(states){return this.db.prepare(`SELECT data,state FROM jobs WHERE state IN (${states.map(()=>'?').join(',')}) ORDER BY created_at`).all(...states).map(r=>({...JSON.parse(r.data),state:r.state}));}
 batch(id){const r=this.db.prepare('SELECT data,state FROM batches WHERE id=?').get(id);return r?{...JSON.parse(r.data),state:r.state}:null;}
 saveBatch(value){this.db.prepare('INSERT INTO batches VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,state=excluded.state').run(value.id,JSON.stringify(value),value.state);}
 batches(){return this.db.prepare("SELECT data,state FROM batches WHERE state NOT IN ('ended','failed')").all().map(r=>({...JSON.parse(r.data),state:r.state}));}
 counts(){return this.db.prepare('SELECT state,COUNT(*) AS count FROM jobs GROUP BY state').all();}
}
