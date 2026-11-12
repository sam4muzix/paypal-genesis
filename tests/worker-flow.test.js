import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from '../src/worker.js';

function localD1(){
 const db=new DatabaseSync(':memory:');
 for(const name of ['0001_init.sql','0002_phase2.sql','0003_demo.sql','0004_checkout.sql','0005_repairs.sql'])db.exec(readFileSync(new URL('../migrations/'+name,import.meta.url),'utf8'));
 return {raw:db,prepare(sql){let args=[];return {bind(...values){args=values;return this},async first(){return db.prepare(sql).get(...args)||null},async all(){return {results:db.prepare(sql).all(...args)}},async run(){const result=db.prepare(sql).run(...args);return {meta:{changes:Number(result.changes)}}}}},async batch(statements){const out=[];db.exec('BEGIN');try{for(const statement of statements)out.push(await statement.run());db.exec('COMMIT');return out}catch(e){db.exec('ROLLBACK');throw e}}};
}
function request(path,method='GET',data,cookie,origin='http://localhost:8787'){return new Request(origin+'/api'+path,{method,headers:{...(method!=='GET'?{origin,'content-type':'application/json'}:{}),...(cookie?{cookie}:{})},body:data?JSON.stringify(data):undefined})}
async function call(env,path,method='GET',data,cookie){const r=await worker.fetch(request(path,method,data,cookie),env);return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')}}
async function registered(env,email){const old=console.log,messages=[];console.log=(line)=>messages.push(line);try{const created=await call(env,'/register','POST',{name:'Local Tester',email,password:'test-password-12345'});assert.equal(created.status,201);const token=new URL(messages.at(-1).split(': ').at(-1)).searchParams.get('verify');assert.equal((await call(env,'/verification/confirm','POST',{token})).status,200);const logged=await call(env,'/login','POST',{email,password:'test-password-12345'});assert.equal(logged.status,200);return logged.cookie.split(';')[0]}finally{console.log=old}}

test('D1-backed consumer registration, verification, login, proposal, support, feedback and isolation',async()=>{
 const DB=localD1(),env={DB,DEV_VERIFICATION_DELIVERY:'log'};
 const cookie=await registered(env,'flow1@example.invalid');
 const another=await registered(env,'flow2@example.invalid');
 const me=await call(env,'/me','GET',null,cookie);assert.ok(me.body.user.email_verified_at);
 const product=await call(env,'/products','POST',{title:'Portable recording console',description:'Eight inputs for mobile recording',category:'Audio'},cookie);assert.equal(product.status,201);
 const id=product.body.id;assert.equal((await call(env,'/products/'+id+'/support','POST',{kind:'interest'},cookie)).status,200);
 assert.equal((await call(env,'/products/'+id+'/feedback','POST',{version:'1',kind:'failure',details:'Input drops out',rating:2},cookie)).status,201);
 assert.equal((await call(env,'/products/'+id+'/spec','POST',{analysis:{title:'Foreign change',requirements:[],questions:[],assumptions:[],complexity:'low'}},another)).status,403);
 const activity=await call(env,'/my/activity','GET',null,cookie);assert.equal(activity.body.supported.length,1);assert.equal(activity.body.feedback.length,1);
 const otherActivity=await call(env,'/my/activity','GET',null,another);assert.equal(otherActivity.body.supported.length,0);
 assert.equal((await call(env,'/products/'+id+'/offers','POST',{price:10,currency:'USD',minimum_quantity:1,terms:'Test'},cookie)).status,403);
 const noOrigin=await worker.fetch(new Request('http://localhost:8787/api/products',{method:'POST',headers:{origin:'http://evil.example',cookie,'content-type':'application/json'},body:JSON.stringify({title:'Blocked',description:'Cross origin'})}),env);assert.equal(noOrigin.status,403);
 assert.equal((await call(env,'/logout','POST',null,cookie)).status,200);assert.equal((await call(env,'/my/activity','GET',null,cookie)).status,401);
});

test('D1-backed DEMO scenarios, payment configuration gate and recommendation access',async()=>{
 const DB=localD1(),env={DB,DEV_VERIFICATION_DELIVERY:'log'};
 const cookie=await registered(env,'buyer@example.invalid');
 const demos=await call(env,'/demo/scenarios');assert.equal(demos.body.products.length,4);
 const product=await call(env,'/products/demo-b');assert.equal(product.body.feedback.length,3);assert.equal(product.body.recommendations.length,1);
 assert.equal((await call(env,'/manufacturer/dashboard','GET',null,cookie)).status,403);
 assert.equal((await call(env,'/orders','POST',{offer_id:'demo-offer-a',consent:true},cookie)).status,503);
 assert.equal((await call(env,'/analyze','POST',{description:'Eight inputs'},cookie)).status,503);
});

test('D1-backed manufacturer offer, timeline, reports and human quality decision',async()=>{
 const DB=localD1(),env={DB,DEV_VERIFICATION_DELIVERY:'log'};
 const buyer=await registered(env,'maker-buyer@example.invalid');
 const maker=await registered(env,'maker@example.invalid');
 const otherMaker=await registered(env,'other-maker@example.invalid');
 DB.raw.prepare("UPDATE users SET role='manufacturer' WHERE email=?").run('maker@example.invalid');
 DB.raw.prepare("UPDATE users SET role='manufacturer' WHERE email=?").run('other-maker@example.invalid');
 const product=(await call(env,'/products','POST',{title:'Test headphones',description:'A new pair for testing'},buyer)).body.id;
 const offer=await call(env,'/products/'+product+'/offers','POST',{price:20,currency:'USD',minimum_quantity:1,terms:'Immediate test fulfillment',eligible:false},maker);assert.equal(offer.status,201);
 assert.equal((await call(env,'/manufacturer/my-products','GET',null,buyer)).status,403);
 assert.equal((await call(env,'/manufacturer/orders','GET',null,buyer)).status,403);
 const offered=await call(env,'/manufacturer/my-products','GET',null,maker);assert.equal(offered.body.products.length,1);assert.equal(offered.body.products[0].id,product);
 assert.equal((await call(env,'/manufacturer/my-products','GET',null,otherMaker)).body.products.length,0);
 assert.equal((await call(env,'/manufacturer/orders','GET',null,maker)).body.orders.length,0);
 assert.equal((await call(env,'/products/'+product+'/transition','POST',{status:'validation',note:'Demand review'},maker)).status,200);
 assert.equal((await call(env,'/products/'+product+'/transition','POST',{status:'launch',note:'Skip stages'},maker)).status,400);
 for(let i=0;i<3;i++)assert.equal((await call(env,'/products/'+product+'/feedback','POST',{version:'1',kind:'failure',details:'Battery life is poor '+i,rating:2},buyer)).status,201);
 const quality=await call(env,'/intelligence/quality','GET',null,maker);assert.equal(quality.body.recommendations.length,1);
 const rec=quality.body.recommendations[0];assert.equal(rec.kind,'IMPROVE');
 assert.equal((await call(env,'/recommendations/'+rec.id+'/decision','POST',{status:'accepted',note:'Investigate battery revision'},buyer)).status,403);
 assert.equal((await call(env,'/recommendations/'+rec.id+'/decision','POST',{status:'accepted',note:'Investigate battery revision'},maker)).status,200);
 const detail=await call(env,'/products/'+product);assert.equal(detail.body.recommendations[0].status,'accepted');assert.equal(detail.body.events[0].to_status,'validation');
});

test('short title grouping, DEMO offer eligibility guard, manufacturer application and offer update',async()=>{
 const DB=localD1(),env={DB,DEV_VERIFICATION_DELIVERY:'log'};
 const consumer=await registered(env,'short-title@example.invalid');
 const admin=await registered(env,'admin-user@example.invalid');
 DB.raw.prepare("UPDATE users SET role='administrator' WHERE email=?").run('admin-user@example.invalid');

 // Short title must not match unrelated products via LIKE '%%'
 const created=await call(env,'/products','POST',{title:'Test',description:'Short title product'},consumer);
 assert.equal(created.status,201);
 assert.deepEqual(created.body.similar,[]);
 const detail=await call(env,'/products/'+created.body.id,'GET',null,consumer);
 assert.equal(detail.body.similar.length,0);

 // Consumer applies for manufacturer, cannot self-approve
 const appRes=await call(env,'/manufacturer/application','POST',{business_name:'Acme Audio',details:'Small-batch CNC & PCB assembly'},consumer);
 assert.equal(appRes.status,201);
 assert.equal((await call(env,'/admin/manufacturers','POST',{application_id:appRes.body.id,status:'approved'},consumer)).status,403);
 assert.equal((await call(env,'/admin/manufacturers','POST',{application_id:appRes.body.id,status:'approved'},admin)).status,200);
 const me=await call(env,'/me','GET',null,consumer);
 assert.equal(me.body.user.role,'manufacturer');
 assert.equal(me.body.application.status,'approved');

 // DEMO product cannot accept eligible: true offer
 const demoOffer=await call(env,'/products/demo-a1/offers','POST',{price:99,currency:'USD',minimum_quantity:1,terms:'Should fail',eligible:true},consumer);
 assert.equal(demoOffer.status,400);

 // Non-DEMO offer can be created ineligible then updated to eligible
 const offer=await call(env,'/products/'+created.body.id+'/offers','POST',{price:49,currency:'USD',minimum_quantity:1,terms:'Prototype batch',eligible:false},consumer);
 assert.equal(offer.status,201);
 const patched=await call(env,'/offers/'+offer.body.id,'PATCH',{eligible:true,price:55},consumer);
 assert.equal(patched.status,200);
 const after=await call(env,'/products/'+created.body.id,'GET',null,consumer);
 assert.equal(after.body.offers[0].eligible,1);
 assert.equal(after.body.offers[0].price,55);
});

test('PayPal Sandbox checkout, reconciliation, capture, duplicate capture guard, cancel and webhook verification',async()=>{
 const DB=localD1(),env={DB,DEV_VERIFICATION_DELIVERY:'log',PAYPAL_CLIENT_ID:'cid',PAYPAL_CLIENT_SECRET:'sec',PAYPAL_WEBHOOK_ID:'wh_1'};
 const buyer=await registered(env,'pp-buyer@example.invalid');
 const otherBuyer=await registered(env,'pp-other@example.invalid');
 const maker=await registered(env,'pp-maker@example.invalid');
 DB.raw.prepare("UPDATE users SET role='manufacturer' WHERE email=?").run('pp-maker@example.invalid');

 const pid=(await call(env,'/products','POST',{title:'Modular DAC Amp',description:'Desktop balanced DAC'},buyer)).body.id;
 const oid=(await call(env,'/products/'+pid+'/offers','POST',{price:149.50,currency:'USD',minimum_quantity:1,terms:'Ships in 10 days',eligible:true},maker)).body.id;

 // Unverified buyer blocked from checkout
 DB.raw.prepare("UPDATE users SET email_verified_at=NULL WHERE email=?").run('pp-other@example.invalid');
 assert.equal((await call(env,'/orders','POST',{offer_id:oid,consent:true},otherBuyer)).status,403);

 let remoteStatus='CREATED';
 let captureStatus='COMPLETED';
 let captureCalls=0;
 const origFetch=globalThis.fetch;
 globalThis.fetch=async(url,opts={})=>{
  const u=String(url);
  if(u.endsWith('/v1/oauth2/token'))return new Response(JSON.stringify({access_token:'tok'}));
  if(u.endsWith('/v2/checkout/orders')&&opts.method==='POST')return new Response(JSON.stringify({id:'PP-ORD-1',links:[{rel:'approve',href:'https://www.sandbox.paypal.com/checkoutnow?token=PP-ORD-1'}]}));
  if(u.endsWith('/v2/checkout/orders/PP-ORD-1')&&(!opts.method||opts.method==='GET'))return new Response(JSON.stringify({id:'PP-ORD-1',status:remoteStatus,purchase_units:[{amount:{currency_code:'USD',value:'149.50'}}]}));
  if(u.endsWith('/v2/checkout/orders/PP-ORD-1/capture')&&opts.method==='POST'){
   captureCalls++;
   return new Response(JSON.stringify({id:'PP-ORD-1',status:captureStatus==='DECLINED'?'COMPLETED':'COMPLETED',purchase_units:[{amount:{currency_code:'USD',value:'149.50'},payments:{captures:[{id:'CAP-99',status:captureStatus}]}}]}));
  }
  if(u.endsWith('/v1/notifications/verify-webhook-signature'))return new Response(JSON.stringify({verification_status:'SUCCESS'}));
  throw new Error('Unexpected fetch: '+u);
 };

 try{
  // 1. Order creation
  const created=await call(env,'/orders','POST',{offer_id:oid,consent:true},buyer);
  assert.equal(created.status,201);
  assert.equal(created.body.status,'CREATED');

  // 2. Capture before approval returns CREATED (not COMPLETED)
  const earlyCap=await call(env,'/orders/'+created.body.id+'/capture','POST',{},buyer);
  assert.equal(earlyCap.body.status,'CREATED');
  assert.equal(captureCalls,0);

  // 3. Reconcile after buyer approves on PayPal
  remoteStatus='APPROVED';
  const rec=await call(env,'/orders/'+created.body.id+'/reconcile','POST',{},buyer);
  assert.equal(rec.body.status,'APPROVED');

  // 4. Duplicate POST /api/orders returns APPROVED without creating new PayPal order
  const dup=await call(env,'/orders','POST',{offer_id:oid,consent:true},buyer);
  assert.equal(dup.body.duplicate,true);
  assert.equal(dup.body.status,'APPROVED');

  // 5. Capture succeeds and saves capture_id; second capture is idempotent (no 2nd PayPal capture call)
  const cap1=await call(env,'/orders/'+created.body.id+'/capture','POST',{},buyer);
  assert.equal(cap1.body.status,'COMPLETED');
  assert.equal(captureCalls,1);
  remoteStatus='COMPLETED';
  const cap2=await call(env,'/orders/'+created.body.id+'/capture','POST',{},buyer);
  assert.equal(cap2.body.status,'COMPLETED');
  assert.equal(captureCalls,1);

  const ordRow=await call(env,'/orders/'+created.body.id,'GET',null,buyer);
  assert.equal(ordRow.body.order.capture_id,'CAP-99');

  // 6. Webhook signature validation, deduplication, out-of-order & denied/voided handling
  const missingHdrs=await worker.fetch(new Request('http://localhost:8787/api/paypal/webhook',{method:'POST',headers:{'content-type':'application/json'},body:'{}'}),env);
  assert.equal(missingHdrs.status,400);

  const whReq=(id,eventType,orderId='PP-ORD-1')=>new Request('http://localhost:8787/api/paypal/webhook',{method:'POST',headers:{'content-type':'application/json','paypal-auth-algo':'SHA256','paypal-cert-url':'https://api.sandbox.paypal.com/cert','paypal-transmission-id':'tid-'+id,'paypal-transmission-sig':'sig','paypal-transmission-time':'2026-11-11T00:00:00Z'},body:JSON.stringify({id,event_type:eventType,resource:{supplementary_data:{related_ids:{order_id:orderId}}}})});
  const wh1=await worker.fetch(whReq('WH-EVT-1','PAYMENT.CAPTURE.COMPLETED'),env);
  assert.equal((await wh1.json()).duplicate,undefined);
  const wh2=await worker.fetch(whReq('WH-EVT-1','PAYMENT.CAPTURE.COMPLETED'),env);
  assert.equal((await wh2.json()).duplicate,true);

  // Out-of-order APPROVED arriving after COMPLETED must NOT downgrade COMPLETED
  const whLate=await worker.fetch(whReq('WH-EVT-2','CHECKOUT.ORDER.APPROVED'),env);
  assert.equal(whLate.status,200);
  const afterLate=await call(env,'/orders/'+created.body.id,'GET',null,buyer);
  assert.equal(afterLate.body.order.status,'COMPLETED');

  // Second order to verify DENIED webhook marks FAILED after PayPal check
  remoteStatus='CREATED';
  const oid2=(await call(env,'/products/'+pid+'/offers','POST',{price:50,currency:'USD',minimum_quantity:1,terms:'Batch 2',eligible:true},maker)).body.id;
  globalThis.fetch=async(url,opts={})=>{
   const u=String(url);
   if(u.endsWith('/v1/oauth2/token'))return new Response(JSON.stringify({access_token:'tok'}));
   if(u.endsWith('/v2/checkout/orders')&&opts.method==='POST')return new Response(JSON.stringify({id:'PP-ORD-2',links:[{rel:'approve',href:'https://www.sandbox.paypal.com/checkoutnow?token=PP-ORD-2'}]}));
   if(u.endsWith('/v2/checkout/orders/PP-ORD-2'))return new Response(JSON.stringify({id:'PP-ORD-2',status:'COMPLETED',purchase_units:[{amount:{currency_code:'USD',value:'50.00'},payments:{captures:[{id:'CAP-DENY',status:'DECLINED'}]}}]}));
   if(u.endsWith('/v1/notifications/verify-webhook-signature'))return new Response(JSON.stringify({verification_status:opts.body.includes('bad-sig')?'FAILURE':'SUCCESS'}));
   throw new Error('Unexpected fetch: '+u);
  };
  const ord2=await call(env,'/orders','POST',{offer_id:oid2,consent:true},buyer);
  const badSig=await worker.fetch(new Request('http://localhost:8787/api/paypal/webhook',{method:'POST',headers:{'content-type':'application/json','paypal-auth-algo':'SHA256','paypal-cert-url':'https://api.sandbox.paypal.com/cert','paypal-transmission-id':'tid-bad','paypal-transmission-sig':'bad-sig','paypal-transmission-time':'2026-11-11T00:00:00Z'},body:JSON.stringify({id:'WH-BAD',event_type:'PAYMENT.CAPTURE.DENIED',resource:{supplementary_data:{related_ids:{order_id:'PP-ORD-2'}}}})}),env);
  assert.equal(badSig.status,403);
  const deniedWh=await worker.fetch(whReq('WH-DENY-1','PAYMENT.CAPTURE.DENIED','PP-ORD-2'),env);
  assert.equal(deniedWh.status,200);
  const ord2After=await call(env,'/orders/'+ord2.body.id,'GET',null,buyer);
  assert.equal(ord2After.body.order.status,'FAILED');
 }finally{
  globalThis.fetch=origFetch;
 }
});
