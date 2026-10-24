#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {Store} from './store.js';
import {Publisher} from './publisher.js';
import {BatchClient} from './batch-client.js';
import {WikiWorker} from './worker.js';

const root=process.env.WIKI_WORKER_STATE??path.join(os.homedir(),'.local/state/project-wiki/automation');
const store=new Store(path.join(root,'worker.sqlite'));
const action=process.argv[2]??'run';
if(action==='status'){
 console.log(JSON.stringify({jobs:store.counts(),pendingBatches:store.batches().map(({id,remoteId,state})=>({id,remoteId,state})),events:store.events().length,lastSourceCheck:store.get('last-source-check'),lastSubmission:store.get('last-submission'),lastSuccessfulTick:store.get('last-successful-tick'),submitError:store.get('submit-error'),pollError:store.get('poll-error'),tickError:store.get('tick-error'),publishPending:Boolean(store.get('publish-intent'))},null,2));store.close();
}else{
 const publisher=new Publisher({checkout:path.join(root,'checkout'),artifacts:path.join(root,'artifacts'),store});
 const client=new BatchClient({url:process.env.AI_PROXY_URL??'http://127.0.0.1:3005',key:process.env.AI_PROXY_API_KEY??''});
 const worker=new WikiWorker({store,client,publisher});
 await publisher.ensure();
 if(action==='check'){store.set('next-source-check',0);await worker.tick();store.close();}
 else if(action==='run'){
  const amqp=await import('amqplib');let connection,channel,busy=false,closing=false;
  const report=code=>{console.error('[wiki-worker] '+code);store.set('tick-error',{at:new Date().toISOString(),code});};
  const connect=async()=>{
   if(connection||closing)return;
   const next=await amqp.connect(process.env.RABBITMQ_URL??'amqp://localhost:5672');
   next.on('error',()=>report('broker-connection-error'));
   next.on('close',()=>{connection=null;channel=null;});
   channel=await next.createChannel();await channel.assertExchange('wiki.events','topic',{durable:true});
   await channel.assertQueue('wiki.updater.queue',{durable:true});
   await channel.bindQueue('wiki.updater.queue','wiki.events','wiki.update.#');
   await channel.bindQueue('wiki.updater.queue','wiki.events','wiki.page.updated');
   await channel.prefetch(16);
   const owned=channel;
   await channel.consume('wiki.updater.queue',message=>{
    if(!message)return;
    try{worker.ingest(message);owned.ack(message);}catch{report('invalid-update-message');owned.nack(message,false,false);}
   },{noAck:false});
   connection=next;
  };
  const tick=async()=>{
   if(busy||closing)return;busy=true;
   try{await connect();}catch{report('broker-unavailable');}
   try{await worker.tick();store.set('tick-error',null);}catch{report('refresh-failed');}
   finally{busy=false;}
  };
  const timer=setInterval(tick,60000);await tick();
  for(const signal of ['SIGTERM','SIGINT'])process.on(signal,async()=>{closing=true;clearInterval(timer);try{await channel?.close();await connection?.close();}catch{}if(!busy){store.close();process.exit(0);}setTimeout(()=>process.exit(0),5000).unref();});
 }else throw Error('Use run, check, or status');
}
