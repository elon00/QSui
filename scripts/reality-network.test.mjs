import test from 'node:test';
import assert from 'node:assert/strict';
import { checkSuiRpc, summarizeReality } from './reality-network.mjs';

const response = data => async () => ({ ok: true, json: async () => data });

test('only a successful checkpoint response counts as network evidence, including checkpoint zero', async () => {
  const result = await checkSuiRpc(response({ jsonrpc: '2.0', id: 1, result: '0' }));
  assert.equal(result.passed, true);
  assert.match(result.evidence, /not deployment verification/);
});

test('HTTP failure, RPC errors, wrong IDs, missing checkpoints, and malformed JSON fail closed', async () => {
  const cases = [
    async () => ({ ok: false }),
    response({ jsonrpc: '2.0', id: 1, error: { code: -32601 } }),
    response({ jsonrpc: '2.0', id: 2, result: '123' }),
    response({ jsonrpc: '2.0', id: 1 }),
    response({ jsonrpc: '2.0', id: 1, result: -1 }),
    response({ jsonrpc: '2.0', id: 1, result: 'NaN' }),
    async () => ({ ok: true, json: async () => { throw new SyntaxError('invalid JSON'); } }),
  ];
  for (const fetchImpl of cases) assert.equal((await checkSuiRpc(fetchImpl)).passed, false);
});

test('offline errors remain unverified and do not leak error details', async () => {
  const result = await checkSuiRpc(async () => { throw new Error('secret-url-token'); });
  assert.equal(result.passed, false);
  assert.doesNotMatch(result.evidence, /secret-url-token/);
});

test('a timed out request fails closed', async () => {
  const result = await checkSuiRpc(async (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }), 5);
  assert.equal(result.passed, false);
});

test('any failed gate forces score zero, failure output, and nonzero exit even with a mistakenly positive input score', () => {
  const summary = summarizeReality([{ passed: true, score: 1 }, { passed: false, score: 1 }]);
  assert.equal(summary.u10Score, 0);
  assert.equal(summary.exitCode, 1);
  assert.equal(summary.verdict, 'CHECKS FAILED OR UNVERIFIED');
  assert.equal(summarizeReality([]).exitCode, 1);
  const success = summarizeReality([{ passed: true, score: 1 }]);
  assert.equal(success.exitCode, 0);
  assert.match(success.verdict, /PRODUCTION AND DEPLOYMENT NOT VERIFIED/);
});
