// Copyright (c) 2026 Quantum Sui Foundation
// SPDX-License-Identifier: Apache-2.0

/// Quantum Sui (QSUI) - Token & Treasury Module. Real PQC verification is not implemented in this Move package.
module quantum_sui::qsui {
    use std::option;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url;
    use sui::event;

    /// One-time witness for the QSUI coin
    public struct QSUI has drop {}

    /// Protocol State storing immutable tokenomics parameters
    public struct QuantumSuiState has key {
        id: UID,
        total_supply: u64,
        max_hard_cap: u64, // 1,000,000,000,000,000 (1,000 Trillion QSUI)
        treasury_active: bool,
        pqc_signature_scheme: vector<u8>, // Research metadata only; not proof of on-chain ML-DSA verification
    }

    /// Event emitted on token minting / distribution
    public struct QsuiDistributedEvent has copy, drop {
        recipient: address,
        amount: u64,
        is_pqc_verified: bool,
    }

    /// Initialize the Quantum Sui token with 1,000 Trillion supply cap
    fun init(witness: QSUI, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            9, // 9 Decimals
            b"QSUI",
            b"Quantum Sui",
            b"Quantum Sui (QSUI) is a research and prototype Web 4.0 token project on Sui.",
            option::some(url::new_unsafe_from_bytes(b"https://ais-pre-glwly4kx6sv4xqcbg2jev6-1014791165952.asia-southeast1.run.app/icon.png")),
            ctx
        );

        // Make metadata public and freeze it
        transfer::public_freeze_object(metadata);

        let state = QuantumSuiState {
            id: object::new(ctx),
            total_supply: 0,
            max_hard_cap: 1000000000000000, // 1,000 Trillion
            treasury_active: true,
            pqc_signature_scheme: b"RESEARCH_METADATA_ONLY",
        };

        transfer::share_object(state);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    /// Mint Quantum Sui tokens under the hard cap
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<QSUI>,
        state: &mut QuantumSuiState,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(state.total_supply + amount <= state.max_hard_cap, 101); // Hard Cap Exceeded
        state.total_supply = state.total_supply + amount;

        let coin = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(coin, recipient);

        event::emit(QsuiDistributedEvent {
            recipient,
            amount,
            is_pqc_verified: false,
        });
    }

    /// PQC verification is not implemented in this Move package.
    public fun verify_pqc_proof(_signature: vector<u8>, _public_key: vector<u8>, _message: vector<u8>): bool {
        false
    }
}
