// Connectivity is evidence only when the expected RPC method succeeds.
// Error details can contain credentials, so report fixed failure reasons.
export async function checkSuiRpc(fetchImpl = fetch, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl('https://fullnode.testnet.sui.io:443', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'sui_getLatestCheckpointSequenceNumber', params: [] }),
      signal: controller.signal,
    });
    if (!response.ok) return { passed: false, evidence: 'Sui Testnet RPC returned an unsuccessful HTTP status' };
    const data = await response.json();
    if (data?.jsonrpc !== '2.0' || data.id !== 1 || data.error ||
        typeof data.result !== 'string' || !/^\d+$/.test(data.result)) {
      return { passed: false, evidence: 'Sui Testnet RPC did not return a valid checkpoint result' };
    }
    return { passed: true, evidence: `Sui Testnet RPC returned checkpoint #${data.result}; this is connectivity, not deployment verification` };
  } catch {
    return { passed: false, evidence: 'Sui Testnet RPC unavailable, timed out, or returned invalid JSON; network health is unverified' };
  } finally {
    clearTimeout(timer);
  }
}

export function summarizeReality(results) {
  const allPassed = results.length > 0 && results.every(result => result.passed);
  const minScore = results.length ? Math.min(...results.map(result => result.passed ? result.score : 0)) : 0;
  return {
    allPassed,
    minScore,
    u10Score: minScore * 10,
    verdict: allPassed ? 'LOCAL CHECKS PASSED; PRODUCTION AND DEPLOYMENT NOT VERIFIED' : 'CHECKS FAILED OR UNVERIFIED',
    exitCode: allPassed ? 0 : 1,
  };
}
