/**
 * SUI.PQC PROTOCOL — NIST FIPS 203 ML-KEM-768 IMPLEMENTATION
 *
 * Wire Invariants:
 * - Public Key: 1,184 bytes
 * - Secret Key: 2,400 bytes
 * - Ciphertext: 1,088 bytes
 * - Shared Secret: 32 bytes
 *
 * Adheres strictly to FIPS 203 §7.3 Implicit Rejection.
 */

import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { keccak_256 } from '@noble/hashes/sha3';

export interface MLKemKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
  publicKeyHex: string;
  commitmentHash: string;
}

export interface EncapsulationResult {
  cipherText: Uint8Array;
  sharedSecret: Uint8Array;
}

export class MLKemEngine {
  public readonly name = 'ML-KEM-768';
  public readonly securityLevel = 'NIST Level 3';
  public readonly publicKeySize = 1184;
  public readonly secretKeySize = 2400;
  public readonly ciphertextSize = 1088;
  public readonly sharedSecretSize = 32;

  public keygen(seed?: Uint8Array): MLKemKeyPair {
    const keys = seed ? ml_kem768.keygen(seed) : ml_kem768.keygen();
    const commitmentHash = '0x' + Buffer.from(keccak_256(keys.publicKey)).toString('hex');
    const publicKeyHex = '0x' + Buffer.from(keys.publicKey).toString('hex');

    return {
      publicKey: keys.publicKey,
      secretKey: keys.secretKey,
      publicKeyHex,
      commitmentHash,
    };
  }

  public encapsulate(recipientPublicKey: Uint8Array): EncapsulationResult {
    if (recipientPublicKey.length !== this.publicKeySize) {
      throw new Error(`Invalid ML-KEM-768 public key size: expected ${this.publicKeySize}, got ${recipientPublicKey.length}`);
    }
    const { cipherText, sharedSecret } = ml_kem768.encapsulate(recipientPublicKey);
    return { cipherText, sharedSecret };
  }

  public decapsulate(cipherText: Uint8Array, secretKey: Uint8Array): Uint8Array {
    if (cipherText.length !== this.ciphertextSize) {
      throw new Error(`Invalid ML-KEM-768 ciphertext size: expected ${this.ciphertextSize}, got ${cipherText.length}`);
    }
    if (secretKey.length !== this.secretKeySize) {
      throw new Error(`Invalid ML-KEM-768 secret key size: expected ${this.secretKeySize}, got ${secretKey.length}`);
    }
    return ml_kem768.decapsulate(cipherText, secretKey);
  }
}

export const mlKemEngine = new MLKemEngine();
