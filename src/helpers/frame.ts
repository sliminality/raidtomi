import type { Seed } from "../../crate/pkg/raidtomi"

/**
 * Reassemble a Seed object into a 64-bit BigInt.
 *
 * wasm-opt has trouble optimizing u64 types, so we can't expose a u64 directly
 * from Rust. In order to pass seeds across the boundary, we store them as two
 * u32 values, and put them back together in JavaScript.
 */
function unpackSeed(seed: Seed): BigInt {
    // Left-shift the first 32 bits to make room to add the next 32 bits.
    return (BigInt(seed[0]) << BigInt(32)) + BigInt(seed[1])
}

export function formatSeed(seed: Seed): string {
    return unpackSeed(seed).toString(16)
}
