/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Terminal, Copy, Check, ExternalLink, Download, ShieldCheck, Cpu, Play, Sparkles, CheckCircle2, ArrowRight, Code2, Globe, Server, RefreshCw, Layers } from 'lucide-react';
import { WalletState } from '../types';
import { emptySuiStatus, normalizeSuiStatus } from '../../scripts/reality-network.mjs';

interface SuiTestnetDeploymentProps {
  wallet: WalletState;
  onConnectClick: () => void;
}

interface TestnetRpcState {
  online: boolean;
  network: string;
  rpcEndpoint: string;
  checkpoint: string;
  epoch: number | null;
  packageId: string;
  treasuryCap: string;
  coinType: string;
  symbol: string;
  name: string;
  maxSupply: string;
  pqcStandard: string;
}

export default function SuiTestnetDeployment({ wallet, onConnectClick }: SuiTestnetDeploymentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cli' | 'move_code' | 'explorer'>('cli');
  const [simulatedDeployStep, setSimulatedDeployStep] = useState<number>(0);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isRefreshingRpc, setIsRefreshingRpc] = useState<boolean>(false);
  const [rpcStatus, setRpcStatus] = useState<TestnetRpcState>(emptySuiStatus());

  const fetchLiveRpc = async () => {
    setIsRefreshingRpc(true);
    try {
      const res = await fetch('/api/sui/testnet-status');
      if (res.ok) {
        const data = await res.json();
        setRpcStatus(normalizeSuiStatus(data));
      } else {
        setRpcStatus(emptySuiStatus());
      }
    } catch {
      setRpcStatus(emptySuiStatus());
    } finally {
      setIsRefreshingRpc(false);
    }
  };

  useEffect(() => {
    fetchLiveRpc();
  }, []);

  const moveCode = `// QSUI prototype sample: uncompiled here; no verified on-chain PQC implementation
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
        max_hard_cap: u64, // 1,000,000,000,000,000 (1,000 Trillion QSUI)
        pqc_signature_scheme: vector<u8>,
    }

    fun init(witness: QSUI, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            9,
            b"QSUI",
            b"Quantum Sui",
            b"QSUI prototype token sample. Cryptographic and deployment properties require independent verification.",
            option::none(),
            ctx
        );
        transfer::public_freeze_object(metadata);
        
        let state = QuantumSuiState {
            id: object::new(ctx),
            total_supply: 0,
            max_hard_cap: 1000000000000000,
            pqc_signature_scheme: b"ML-DSA-87 (NIST FIPS 204)",
        };
        transfer::share_object(state);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }
}`;

  const moveToml = `[package]
name = "quantum_sui"
version = "1.0.0"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "testnet" }

[addresses]
quantum_sui = "0x0"`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSimulateCliPublish = () => {
    setIsPublishing(true);
    setSimulatedDeployStep(1);

    setTimeout(() => setSimulatedDeployStep(2), 800);
    setTimeout(() => setSimulatedDeployStep(3), 1600);
    setTimeout(() => {
      setSimulatedDeployStep(4);
      setIsPublishing(false);
    }, 2400);
  };

  return (
    <section id="sui-deployment" className="py-20 border-t border-slate-900 bg-slate-950 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/40 border border-teal-800/40 px-3 py-1 rounded-full">
            <Server className="w-3.5 h-3.5 text-teal-400" />
            <span>Sui TestNet Deployment Hub</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Deploy Quantum Sui (QSUI) on Sui Testnet
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Prototype Move source and a local release-plan preview. Build, bytecode verification, wallet signing and on-chain deployment require independent execution and evidence.
          </p>
        </div>

        {/* Live Network Status Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-3 h-3 rounded-full bg-slate-500 shrink-0" />
            <div>
              <div className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Sui Testnet: read-only network observation</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                  Deployment unverified
                </span>
                <button
                  onClick={fetchLiveRpc}
                  disabled={isRefreshingRpc}
                  className="text-slate-400 hover:text-cyan-300 transition cursor-pointer flex items-center gap-1 text-[11px] ml-2"
                  title="Refresh Live Sui Testnet Node Data"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingRpc ? 'animate-spin text-cyan-400' : ''}`} />
                  <span className="hidden sm:inline">Sync Node</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Endpoint: {rpcStatus.rpcEndpoint} | Epoch: {rpcStatus.epoch} | Checkpoint: {rpcStatus.checkpoint}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <a
              href="https://suiscan.xyz/testnet"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-950 text-slate-300 border border-slate-800 hover:border-cyan-500/40 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Suiscan TestNet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://discord.com/invite/sui"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800 hover:bg-cyan-900/60 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Get Testnet SUI Faucet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mb-8 gap-3">
          <button
            onClick={() => setActiveTab('cli')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'cli'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>1. CLI Deploy Commands</span>
          </button>

          <button
            onClick={() => setActiveTab('move_code')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'move_code'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. Move Smart Contract Code</span>
          </button>

          <button
            onClick={() => setActiveTab('explorer')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'explorer'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>3. Testnet Package Verification</span>
          </button>
        </div>

        {/* Tab 1: CLI Deploy Commands */}
        {activeTab === 'cli' && (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4 shadow-xl">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>3-Step Sui Testnet Publish Guide</span>
                </h3>

                <div className="space-y-4 text-xs text-slate-300">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">Step 1: Set Environment to Sui Testnet</span>
                      <button
                        onClick={() => copyToClipboard('sui client switch --env testnet', 'step1')}
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <code className="block font-mono bg-slate-900 p-2.5 rounded-lg text-slate-200 text-[11px] select-all">
                      sui client switch --env testnet
                    </code>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">Step 2: Build & Verify Move Bytecode</span>
                      <button
                        onClick={() => copyToClipboard('sui move build', 'step2')}
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <code className="block font-mono bg-slate-900 p-2.5 rounded-lg text-slate-200 text-[11px] select-all">
                      sui move build
                    </code>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">Step 3: Publish Move Package On-Chain</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            'sui client publish --gas-budget 100000000 ',
                            'step3'
                          )
                        }
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <code className="block font-mono bg-slate-900 p-2.5 rounded-lg text-slate-200 text-[11px] select-all">
                      sui client publish --gas-budget 100000000 
                    </code>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSimulateCliPublish}
                    disabled={isPublishing}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isPublishing ? 'Previewing local release steps...' : 'Preview release plan (no transaction)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Terminal Output */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-850 p-6 rounded-3xl flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono font-bold text-slate-400 ml-2">Local release-plan preview</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">Target: TestNet</span>
                </div>

                <div className="font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2 overflow-y-auto h-[320px]">
                  <div className="text-slate-500">$ sui client active-env</div>
                  <div className="text-emerald-400">Proposed target: testnet; no CLI command executed here</div>
                  
                  {simulatedDeployStep >= 1 && (
                    <>
                      <div className="text-slate-500 pt-2">$ sui move build</div>
                      <div className="text-cyan-300">Plan: resolve and review Sui dependencies</div>
                      <div className="text-cyan-300">Plan: build quantum_sui with the Sui CLI</div>
                      <div className="text-emerald-400">Build and bytecode verification have not run in this preview</div>
                    </>
                  )}

                  {simulatedDeployStep >= 2 && (
                    <>
                      <div className="text-slate-500 pt-2">$ sui client publish --gas-budget 100000000</div>
                      <div className="text-slate-400">Plan: review the transaction and wallet permissions</div>
                      <div className="text-amber-300">No signing or transaction broadcast occurs in this preview</div>
                    </>
                  )}

                  {simulatedDeployStep >= 3 && (
                    <>
                      <div className="text-emerald-400">Transaction digest: unavailable (nothing broadcast)</div>
                      <div className="text-slate-300">Transaction status: <span className="text-slate-400 font-bold">Not executed</span></div>
                      <div className="text-slate-300">Gas cost: unknown; no transaction executed</div>
                    </>
                  )}

                  {simulatedDeployStep >= 4 && (
                    <div className="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-800 text-[11px] text-cyan-200 mt-2">
                      <div className="font-bold text-white">CONFIGURED VALUES (not deployment evidence):</div>
                      <div>• PackageID: <span className="font-mono text-teal-300">{rpcStatus.packageId}</span></div>
                      <div>• TreasuryCap&lt;QSUI&gt;: {rpcStatus.treasuryCap}</div>
                      <div>• Shared state object: unverified</div>
                      <div>• Total Supply: {rpcStatus.maxSupply} QSUI</div>
                    </div>
                  )}

                  {simulatedDeployStep === 0 && (
                    <div className="text-slate-600 italic py-16 text-center">
                      Click "Preview release plan (no transaction)" to preview the release checklist. This does not build, sign or publish anything.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Move Smart Contract Code */}
        {activeTab === 'move_code' && (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="font-extrabold text-sm text-white font-mono">sources/quantum_sui.move</div>
                  <div className="text-[10px] text-slate-400">1,000 Trillion Hard-Cap & TreasuryCap Move Module</div>
                </div>
                <button
                  onClick={() => copyToClipboard(moveCode, 'move_code')}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode === 'move_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Code</span>
                </button>
              </div>

              <pre className="font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-850 overflow-x-auto h-[380px] leading-relaxed">
                {moveCode}
              </pre>
            </div>

            <div className="lg:col-span-6 bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="font-extrabold text-sm text-white font-mono">Move.toml</div>
                  <div className="text-[10px] text-slate-400">Sui Move Package Manifest Configuration</div>
                </div>
                <button
                  onClick={() => copyToClipboard(moveToml, 'move_toml')}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode === 'move_toml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy TOML</span>
                </button>
              </div>

              <pre className="font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-850 overflow-x-auto h-[380px] leading-relaxed">
                {moveToml}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Testnet Package Verification */}
        {activeTab === 'explorer' && (
          <div className="bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h3 className="font-extrabold text-lg text-white">Configured Sui Testnet values</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configured addresses and proposed metadata require independent on-chain verification.
                </p>
              </div>

              <a
                href={`https://suiscan.xyz/testnet/object/${rpcStatus.packageId}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Inspect on Suiscan Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400">Coin Package ID</span>
                <div className="font-mono text-xs text-cyan-300 break-all select-all font-bold">
                  {rpcStatus.packageId}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Bytecode verification pending
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400">Total Supply Hard Cap</span>
                <div className="font-mono text-sm text-slate-100 font-extrabold">
                  {rpcStatus.maxSupply} QSUI
                </div>
                <div className="text-[10px] text-teal-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> On-chain supply unverified
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400">PQC Signature Scheme</span>
                <div className="font-mono text-xs text-purple-300 font-bold">
                  {rpcStatus.pqcStandard}
                </div>
                <div className="text-[10px] text-purple-400 flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> On-chain PQC unverified
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
