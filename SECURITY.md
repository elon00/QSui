# Security Policy

## Status

QSui is a research/testnet-oriented prototype. It is not an independently audited mainnet product.

## Reporting

Please avoid publishing exploitable details, credentials, private keys, seed phrases, or user data in a public issue. Report sensitive findings privately through GitHub's security-reporting facilities when available.

Include:

- affected commit/version
- affected file or component
- reproduction steps
- expected vs actual behavior
- security impact
- proposed mitigation if known

## Cryptography scope

The repository contains application-layer ML-DSA/ML-KEM experiments. The checked-in Sui Move modules do not currently provide production PQC enforcement. Do not infer FIPS validation or whole-system quantum resistance from algorithm usage alone.

## Secrets

Never commit Sui private keys, mnemonics, API keys, deployment credentials, or Gemini credentials.

## Production boundary

Before any production/mainnet claim, require at minimum:

1. reproducible CI and locked dependency audit;
2. independent Move/smart-contract security review;
3. verified on-chain deployment evidence;
4. secrets/key-management and upgrade procedures;
5. monitoring, incident response and rollback planning;
6. legal/compliance review where token distribution or financial activity is involved.
