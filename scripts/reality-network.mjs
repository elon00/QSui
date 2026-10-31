// Read-only Sui Testnet GraphQL observation; never deployment verification.
export const SUI_TESTNET_GRAPHQL_URL = 'https://graphql.testnet.sui.io/graphql';
const checkpointText = value => typeof value === 'number'
  ? Number.isSafeInteger(value) && value >= 0 ? String(value) : null
  : typeof value === 'string' && /^\d+$/.test(value) ? value : null;

export async function checkSuiRpc(fetchImpl = fetch, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(SUI_TESTNET_GRAPHQL_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ checkpoint { sequenceNumber } }' }),
      signal: controller.signal,
    });
    if (!response.ok) return { passed: false, evidence: 'Sui Testnet GraphQL returned an unsuccessful HTTP status' };
    const data = await response.json();
    const checkpoint = checkpointText(data?.data?.checkpoint?.sequenceNumber);
    if (checkpoint === null || (data.errors !== undefined && (!Array.isArray(data.errors) || data.errors.length > 0))) {
      return { passed: false, evidence: 'Sui Testnet GraphQL did not return a valid checkpoint result' };
    }
    return { passed: true, checkpoint, evidence: `Sui Testnet GraphQL returned checkpoint #${checkpoint}; this is connectivity, not deployment verification` };
  } catch {
    return { passed: false, evidence: 'Sui Testnet GraphQL unavailable, timed out, or returned invalid JSON; network health is unverified' };
  } finally { clearTimeout(timer); }
}

export function emptySuiStatus() {
  return {
    online: false, network: 'Sui Testnet GraphQL', rpcEndpoint: SUI_TESTNET_GRAPHQL_URL,
    checkpoint: 'Not verified', epoch: null, packageId: '', treasuryCap: '', coinType: '',
    symbol: 'QSUI', name: 'QSui prototype', maxSupply: 'Not verified',
    pqcStandard: 'Application-layer experiments; on-chain verification not established',
    deploymentVerifiedByThisEndpoint: false,
  };
}
export function normalizeSuiStatus(data) {
  const empty = emptySuiStatus();
  const checkpoint = checkpointText(data?.checkpoint);
  if (data?.online !== true || checkpoint === null) return empty;
  const identifier = value => typeof value === 'string' && /^0x[0-9a-f]{64}$/i.test(value) ? value : '';
  return { ...empty, online: true, checkpoint,
    packageId: identifier(data.packageId), treasuryCap: identifier(data.treasuryCap),
    epoch: Number.isSafeInteger(data.epoch) && data.epoch >= 0 ? data.epoch : null,
  };
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
