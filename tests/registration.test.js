import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';

function database(){
 const users=new Map(),tokens=new Map(),sessions=new Map(),limits=new Map(),audit=[];
 return {users,tokens,sessions,audit,prepare(sql){let args=[];return {bind(...values){args=values;return this},async first(){
  if(sql.startsWith('SELECT u.id,u.email')){const row=sessions.get(args[0]);return row?users.get(row):null}
  if(sql.startsWith('SELECT count,window_start'))return limits.get(args[0])||null;
  if(sql.startsWith('SELECT * FROM users WHERE email'))return users.get(args[0])||null;
  if(sql.startsWith('SELECT user_id FROM verification_tokens'))return tokens.get(args[0])||null;
  return null;
 },async run(){
  if(sql.startsWith('INSERT INTO rate_limits'))limits.set(args[0],{count:1,window_start:args[1]});
  else if(sql.startsWith('UPDATE rate_limits'))limits.get(args[0]).count++;
  else if(sql.startsWith('INSERT INTO users')){if(users.has(args[1]))throw Error('UNIQUE constraint');users.set(args[1],{id:args[0],email:args[1],name:args[2],password_hash:args[3],role:'consumer',email_verified_at:null})}
  else if(sql.startsWith('INSERT INTO audit'))audit.push(args);
  else if(sql.startsWith('DELETE FROM verification_tokens')){for(const [key,row] of tokens)if(row.user_id===args[0]||key===args[0])tokens.delete(key)}
  else if(sql.startsWith('INSERT INTO verification_tokens'))tokens.set(args[0],{user_id:args[1]});
  else if(sql.startsWith('INSERT INTO sessions'))sessions.set(args[0],args[1]);
  else if(sql.startsWith('UPDATE users SET email_verified_at')){for(const user of users.values())if(user.id===args[0])user.email_verified_at='verified'}
  return {meta:{changes:1}};
 }}},async batch(statements){for(const statement of statements)await statement.run()}};
}
function post(path,data){return new Request('http://localhost:8787/api/'+path,{method:'POST',headers:{origin:'http://localhost:8787','content-type':'application/json'},body:JSON.stringify(data)})}
test('registration issues a single-use token, login works, duplicate email is rejected',async()=>{
 const db=database(),env={DB:db,DEV_VERIFICATION_DELIVERY:'log'},messages=[];
 const previous=console.log;console.log=(...values)=>messages.push(values.join(' '));
 try{
  const data={name:'Test Consumer',email:'test@example.invalid',password:'a-long-test-password'};
  const first=await worker.fetch(post('register',data),env);assert.equal(first.status,201);assert.equal(db.users.size,1);assert.equal(db.tokens.size,1);
  assert.notEqual(db.users.get(data.email).password_hash,data.password);
  const duplicate=await worker.fetch(post('register',data),env);assert.equal(duplicate.status,409);assert.deepEqual(await duplicate.json(),{error:'Email already registered'});
  const login=await worker.fetch(post('login',{email:data.email,password:data.password}),env);assert.equal(login.status,200);assert.match(login.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Strict/);
  const token=new URL(messages[0].split(': ').at(-1)).searchParams.get('verify');assert.ok(token);
  const verified=await worker.fetch(post('verification/confirm',{token}),env);assert.equal(verified.status,200);assert.ok(db.users.get(data.email).email_verified_at);
  const repeat=await worker.fetch(post('verification/confirm',{token}),env);assert.equal(repeat.status,400);
 }finally{console.log=previous}
});
test('registration refuses missing development delivery before account creation',async()=>{
 const db=database();const response=await worker.fetch(post('register',{name:'Test',email:'missing@example.invalid',password:'a-long-test-password'}),{DB:db});
 assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:'Verification delivery is not configured'});assert.equal(db.users.size,0)
});
