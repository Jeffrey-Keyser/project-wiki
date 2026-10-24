export class BatchClient{
 constructor({url,key,fetcher=fetch}){this.url=url.replace(/\/$/,'');this.key=key;this.fetcher=fetcher;}
 async call(method,route,body){
  const response=await this.fetcher(this.url+route,{method,headers:{authorization:`Bearer ${this.key}`,'content-type':'application/json','x-model-source':'request'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(45000),redirect:'error'});
  let data;try{data=await response.json();}catch{throw Object.assign(Error('invalid-proxy-response'),{code:'INVALID_PROXY_RESPONSE'});}
  if(!response.ok)throw Object.assign(Error(data.error?.code??'proxy-rejected'),{code:data.error?.code??'PROXY_REJECTED',status:response.status});
  return data;
 }
 submit(body){return this.call('POST','/v1/batches',body);}
 results(id){if(!/^[0-9a-f-]{36}$/.test(id))throw Error('invalid-batch-id');return this.call('GET',`/v1/batches/${id}/results`);}
}
