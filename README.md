# Quantum Sui (QSUI)
### Sui Move, Conway Automaton, Token Accounting & PQC Migration Research

<div align="center">

[![Status](https://img.shields.io/badge/Status-Research%20%2F%20Testnet--Oriented-orange?style=for-the-badge)](#reality-status)
[![PQC Standard](https://img.shields.io/badge/NIST-FIPS%20204%20ML--DSA-7B2CBF?style=for-the-badge)](https://csrc.nist.gov/)
[![Token Model](https://img.shields.io/badge/Tokenomics-Design%20Model-lightgrey?style=for-the-badge)](#tokenomics-1000-trillion-qsui-supply)
[![Netlify Status](https://img.shields.io/badge/Hosted%20On-Netlify-00AD9F?style=for-the-badge&logo=netlify&logoColor=white)](https://qsui.netlify.app)
[![License](https://img.shields.io/badge/License-Apache%202.0-F39C12?style=for-the-badge)](LICENSE)

**Public Web App (deployment status must be independently checked):** [https://qsui.netlify.app](https://qsui.netlify.app)  
**Sui Testnet Explorer:** [https://suiscan.xyz/testnet](https://suiscan.xyz/testnet)

</div>

---

## Reality status

**Status: RESEARCH / TESTNET-ORIENTED PROTOTYPE — NOT MAINNET OR INDEPENDENTLY AUDITED**

What the repository can currently evidence:

- TypeScript/React application code and locked Node dependencies
- Sui Move source for the token/automaton experiments
- repository cryptographic integration tests for selected ML-DSA/ML-KEM behavior
- deterministic truth/environment checks
- buildable local web application when CI is green

What is **not** established by this repository alone:

- production Sui mainnet deployment
- independent smart-contract or cryptographic audit
- FIPS validation of the application as a cryptographic module
- real liquidity, exchange listings, token value, users, TVL, revenue, or market adoption
- legal/securities compliance
- production PQC enforcement inside the checked-in Move contracts

## 🌌 Overview

**Quantum Sui (QSUI)** is a research prototype exploring Sui Move, Conway cellular automata, local token/accounting interfaces, AI-assisted UX, and future post-quantum migration concepts. 

The checked-in Move package does **not** implement ML-DSA or ML-KEM verification. PQC references are research and migration goals until a reviewed implementation, vectors, and reproducible evidence are added.

The repository combines a Sui Move token experiment, Conway cellular-automaton code, AI-assisted interfaces, tokenomics design material, and cryptographic integration tests. These components are not evidence of market deployment, legal compliance, audited token issuance, or production-grade PQC on Sui.

---

## 🏛️ Key Ecosystem Modules

```
QSUI Architecture
├── move/                                # Sui Move Smart Contracts
│   ├── Move.toml                        # Package manifest (quantum_sui)
│   └── sources/
│       ├── quantum_sui.move             # 1,000T Hard-Cap QSUI Token & TreasuryCap
│       └── conway_automaton.move        # On-chain Conway AI Automaton & Entropy Beacon
├── src/                                 # Full-Stack React 19 Frontend
│   ├── components/
│   │   ├── Hero.tsx                     # Dynamic landing & token swap simulator
│   │   ├── TokenLaunchpad.tsx           # IDO allocation tiers, vesting & fair launch
│   │   ├── ConwayAutomaton.tsx          # Interactive Game of Life with quantum entropy
│   │   ├── AiAgentChatbot.tsx           # Multi-persona Gemini 3.7 AI Sentinel
│   │   ├── SuiTestnetDeployment.tsx     # 1-Click Sui CLI commands & node sync
│   │   ├── QuantumSimulator.tsx         # Shor's 4096-qubit lattice attack sandbox
│   │   ├── TokenomicsAndMarketing.tsx   # 1,000T allocation & GTM flywheel
│   │   ├── LawsAndSecurities.tsx        # SEC Howey Test & formal verification suite
│   │   ├── About.tsx                    # Technical thesis & team vision
│   │   ├── Roadmap.tsx                  # 4-Phase post-quantum development roadmap
│   │   ├── Navbar.tsx                   # Sticky navigation & wallet management
│   │   ├── Footer.tsx                   # Comprehensive disclosures & links
│   │   └── WalletModal.tsx              # Sui & PQC lattice wallet connector
│   ├── App.tsx                          # Core application state router
│   ├── main.tsx                         # Client hydration entrypoint
│   ├── types.ts                         # Complete TypeScript domain definitions
│   └── utils.ts                         # Formatting, math & quantum utilities
├── server.ts                            # Express + Gemini AI server & Vite middleware
├── netlify.toml                         # Netlify build & SPA routing configuration
├── package.json                         # Dependencies and scripts
└── tsconfig.json                        # TypeScript configuration
```

---

## 📜 Move Smart Contracts

### 1. QSUI Token Module (`quantum_sui::qsui`)
- **Supply Cap**: `1,000,000,000,000,000` (1,000 Trillion QSUI with 9 Decimals)
- **Treasury Management**: Enforces non-duplicable `TreasuryCap<QSUI>` and hard-cap bounds.
- **PQC status**: Research metadata only; the current Move module does not perform ML-DSA verification.

```move
module quantum_sui::qsui {
    use std::option;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url;

    public struct QSUI has drop {}

    public struct QuantumSuiState has key {
        id: UID,
        total_supply: u64,
        max_hard_cap: u64, // 1,000,000,000,000,000
        treasury_active: bool,
        pqc_signature_scheme: vector<u8>,
    }

    fun init(witness: QSUI, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            9,
            b"QSUI",
            b"Quantum Sui",
            b"Quantum Sui (QSUI) is the premier Post-Quantum Cryptographic Web 4.0 token on Sui.",
            option::none(),
            ctx
        );
        transfer::public_freeze_object(metadata);
        
        let state = QuantumSuiState {
            id: object::new(ctx),
            total_supply: 0,
            max_hard_cap: 1000000000000000,
            treasury_active: true,
            pqc_signature_scheme: b"RESEARCH_METADATA_ONLY",
        };
        transfer::share_object(state);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }
}
```

### 2. Conway Cellular Automaton (`quantum_sui::conway_automaton`)
- Move module for cellular-state experiments. Local/source verification does not prove independent public-network deployment or security.

---

## 🚀 Sui Testnet Deployment Guide

### Prerequisites
- Sui CLI (`sui`)
- Active Sui Testnet Address with test SUI gas

### 1. Switch to Sui Testnet
```bash
sui client switch --env testnet
```

### 2. Request Testnet SUI Faucet
```bash
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
--header 'Content-Type: application/json' \
--data-raw '{
    "FixedAmountRequest": {
        "recipient": "<YOUR_SUI_TESTNET_ADDRESS>"
    }
}'
```

### 3. Build & Verify Move Bytecode
```bash
cd move
sui move build
```

### 4. Publish to Sui Testnet
```bash
sui client publish --gas-budget 100000000 --skip-dependency-verification
```

---

## Tokenomics design model (1,000 Trillion QSUI cap)

| Category | Percentage | Allocation (QSUI) | Vesting / Utility |
| :--- | :--- | :--- | :--- |
| **Community Staking & Mining** | 35% | 350,000,000,000,000 | Staking rewards for Conway nodes & PQC validators |
| **Token Launchpad (IDO)** | 20% | 200,000,000,000,000 | 20% TGE unlock with 6-month linear distribution |
| **Ecosystem & Research Grants**| 15% | 150,000,000,000,000 | Academic lattice cryptography & Web 4.0 AI tooling |
| **Liquidity / market allocation concept** | 12% | 120,000,000,000,000 | Design allocation only; no locked liquidity or exchange listing is claimed |
| **Core Devs & Cryptographers** | 10% | 100,000,000,000,000 | 12-month cliff with 36-month linear vesting |
| **Security / review allocation concept** | 8% | 80,000,000,000,000 | Design allocation only; independent audit is not claimed |

---

## Local development

### 1. Clone & Install
```bash
git clone https://github.com/elon00/QSui.git
cd QSui
npm install
```

### 2. Configure Environment
Create `.env` or `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🌐 Deploy to Netlify

### Using Netlify CLI:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

The application is configured via [`netlify.toml`](netlify.toml) with automatic single-page app (SPA) rewrites to support dynamic client routing.

---

## ⚖️ Legal and compliance research status

- This repository is **not** a legal opinion, SEC classification, MiCA certification, or securities-compliance determination.
- Move verification and fuzzing claims require reproducible test artifacts before being presented as verified.

---

## 📄 License
This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE) for details.

<div align="center">
  <sub>Built by <b>Quantum Sui Foundation</b> — Securing Web 4.0 on Sui Blockchain.</sub>
</div>
