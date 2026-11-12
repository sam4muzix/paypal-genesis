// Read-only integration preflight. Never prints credential values or bearer tokens.
import {readFileSync} from 'node:fs';
import {geminiModel,generationUrl,listGenerationModels,selectModel,parseSpecificationResponse,specificationRequest} from '../src/gemini.js';
const settings={};try{for(const line of readFileSync(new URL('../.dev.vars',import.meta.url),'utf8').split(/\r?\n/)){const m=/^([A-Z_]+)=(.*)$/.exec(line.trim());if(m)settings[m[1]]=m[2].replace(/^['"]|['"]$/g,'')}}catch{}
const key=settings.GEMINI_API_KEY||process.env.GEMINI_API_KEY;
const configured=geminiModel({GEMINI_MODEL:settings.GEMINI_MODEL||process.env.GEMINI_MODEL});
if(!key)console.log('Gemini: BLOCKED (GEMINI_API_KEY missing)');else{
 try{
  const models=await listGenerationModels(key);
  const model=selectModel(models,configured);
  if(!model)throw Error('no generateContent model authorized for this key');
  if(model!==configured)console.log(`Gemini: configured model ${configured} unavailable; testing ${model}. Set GEMINI_MODEL=${model} for the Worker.`);
  const r=await fetch(generationUrl(model),{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify(specificationRequest('A portable eight-input professional audio interface with dual USB-C. Target price below $250 is aspirational and unverified.'))});
  if(!r.ok){const raw=await r.text();let error;try{error=JSON.parse(raw).error}catch{};const message=String(error?.message||'Provider response unavailable').replaceAll(key,'[redacted]').slice(0,500);throw Error(`generateContent HTTP ${r.status}: ${message}`)}
  const response=await r.json();console.log(`Gemini: generation HTTP ${r.status}; model ${model}; candidates ${response.candidates?.length||0}; finishReason ${response.candidates?.[0]?.finishReason||'none'}`);
  const data=parseSpecificationResponse(response);
  console.log('Gemini: genuine HTTP 200 specification response passed schema; model '+model);console.log('Requirements: '+data.requirements.length+'; questions: '+data.questions.length+'; assumptions: '+data.assumptions.length);
 }catch(e){console.error('Gemini: FAILED '+e.message);process.exitCode=1}
}
const client=settings.PAYPAL_CLIENT_ID||process.env.PAYPAL_CLIENT_ID,secret=settings.PAYPAL_CLIENT_SECRET||process.env.PAYPAL_CLIENT_SECRET;
if(!client||!secret)console.log('PayPal Sandbox: BLOCKED (merchant client ID or secret missing)');else{
 try{const r=await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token',{method:'POST',headers:{authorization:'Basic '+btoa(client+':'+secret),'content-type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});if(!r.ok)throw Error('OAuth HTTP '+r.status);const data=await r.json();if(!data.access_token)throw Error('token missing');console.log('PayPal Sandbox: genuine merchant OAuth passed; checkout and buyer capture NOT TESTED')}
 catch(e){console.error('PayPal Sandbox: FAILED '+e.message);process.exitCode=1}
}
