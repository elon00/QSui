/**
 * SUI.PQC PROTOCOL — NIST FIPS 204 ML-DSA-65 IMPLEMENTATION
 *
 * Wire Invariants:
 * - Public Key: 1,952 bytes
 * - Secret Key: 4,032 bytes
 * - Signature: 3,309 bytes
 */

import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { keccak_256 } from '@noble/hashes/sha3';

export interface MLDsaKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
  publicKeyHex: string;
  commitmentHash: string;
}

export class MLDsaEngine {
  public readonly name = 'ML-DSA-65';
  public readonly securityLevel = 'NIST Level 3';
  public readonly publicKeySize = 1952;
  public readonly secretKeySize = 4032;
  public readonly signatureSize = 3309;

  public keygen(seed?: Uint8Array): MLDsaKeyPair {
    const keys = seed ? ml_dsa65.keygen(seed) : ml_dsa65.keygen();
    const commitmentHash = '0x' + Buffer.from(keccak_256(keys.publicKey)).toString('hex');
    const publicKeyHex = '0x' + Buffer.from(keys.publicKey).toString('hex');

    return {
      publicKey: keys.publicKey,
      secretKey: keys.secretKey,
      publicKeyHex,
      commitmentHash,
    };
  }

  public sign(message: Uint8Array, secretKey: Uint8Array): Uint8Array {
    if (secretKey.length !== this.secretKeySize) {
      throw new Error(`Invalid ML-DSA-65 secret key size: expected ${this.secretKeySize}, got ${secretKey.length}`);
    }
    return ml_dsa65.sign(message, secretKey);
  }

  public verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): boolean {
    if (signature.length !== this.signatureSize) return false;
    if (publicKey.length !== this.publicKeySize) return false;
    try {
      return ml_dsa65.verify(signature, message, publicKey);
    } catch {
      return false;
    }
  }
}

export const mlDsaEngine = new MLDsaEngine();
