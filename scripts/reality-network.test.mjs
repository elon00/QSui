import test from 'node:test';
import assert from 'node:assert/strict';
import { checkSuiRpc, summarizeReality, emptySuiStatus, normalizeSuiStatus, SUI_TESTNET_GRAPHQL_URL } from './reality-network.mjs';
const response = data => async () => ({ok:true,json:async()=>data});
test('GraphQL checkpoint observation accepts numeric and decimal string zero', async () => {
 for (const value of [0, '0', 123]) {
  const result=await checkSuiRpc(async(url,options)=>{
   assert.equal(url,SUI_TESTNET_GRAPHQL_URL);
   assert.deepEqual(JSON.parse(options.body),{query:'{ checkpoint { sequenceNumber } }'});
   return {ok:true,json:async()=>({data:{checkpoint:{sequenceNumber:value}}})};
  });
  assert.equal(result.passed,true);
  assert.match(result.evidence,/not deployment verification/);
 }
});
test('GraphQL errors, legacy responses, malformed and unsafe checkpoints fail closed', async () => {
 const invalid=[
  {errors:[{message:'denied'}]},
  {data:{checkpoint:{sequenceNumber:1}},errors:[{message:'partial error'}]},
  {jsonrpc:'2.0',id:1,result:'123'},
  {},{data:{checkpoint:null}},
  ...[-1,1.5,Number.MAX_SAFE_INTEGER+1,'NaN','-1',null].map(sequenceNumber=>({data:{checkpoint:{sequenceNumber}}}))
 ];
 for(const data of invalid)assert.equal((await checkSuiRpc(response(data))).passed,false);
 assert.equal((await checkSuiRpc(async()=>({ok:false}))).passed,false);
 assert.equal((await checkSuiRpc(async()=>({ok:true,json:async()=>{throw new Error('bad JSON')}}))).passed,false);
});
test('offline errors remain unverified and do not expose provider error details', async()=>{
 const result=await checkSuiRpc(async()=>{throw new Error('secret-url-token')});
 assert.equal(result.passed,false);assert.doesNotMatch(result.evidence,/secret-url-token/);
});
test('timeout fails closed',async()=>{
 const result=await checkSuiRpc(async(_url,options)=>new Promise((_resolve,reject)=>{
  options.signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true});
 }),5);
 assert.equal(result.passed,false);
});
test('failure verdict has zero score and nonzero exit even if a failed gate carried positive input score',()=>{
 const summary=summarizeReality([{passed:true,score:1},{passed:false,score:1}]);
 assert.equal(summary.u10Score,0);assert.equal(summary.exitCode,1);
 assert.equal(summarizeReality([]).exitCode,1);
 assert.match(summarizeReality([{passed:true,score:1}]).verdict,/PRODUCTION AND DEPLOYMENT NOT VERIFIED/);
});
test('fresh and failed UI states contain no fabricated deployment identity or cached online status',()=>{
 const initial=emptySuiStatus();assert.equal(initial.online,false);assert.equal(initial.packageId,'');assert.equal(initial.treasuryCap,'');
 const healthy=normalizeSuiStatus({online:true,checkpoint:'123',packageId:'0x'+'11'.repeat(32),deploymentVerifiedByThisEndpoint:true});
 assert.equal(healthy.online,true);assert.equal(healthy.deploymentVerifiedByThisEndpoint,false);
 const failed=normalizeSuiStatus({...healthy,online:false});
 assert.equal(failed.online,false);assert.equal(failed.packageId,'');assert.equal(failed.checkpoint,'Not verified');
 assert.equal(normalizeSuiStatus({online:true,checkpoint:'not a checkpoint'}).online,false);
});
