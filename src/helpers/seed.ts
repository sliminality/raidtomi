import type { Seed } from "../../crate/pkg/raidtomi"

const LOCAL_SEED_KEY = "seed"

export function createDefaultSeed(): BigInt {
    const defaultSeed = BigInt("0xbb810e6006a2a035")
    const serializedSeed = localStorage.getItem(LOCAL_SEED_KEY)
    if (serializedSeed) {
        let parsed: BigInt
        try {
            parsed = BigInt(`0x${serializedSeed}`)
        } catch (error) {
            parsed = defaultSeed
        }
        return parsed
    }
    return defaultSeed
}

export function saveSeed(seed: BigInt): void {
    console.log(seed.toString(16))
    localStorage.setItem(LOCAL_SEED_KEY, seed.toString(16))
}

export function clearSavedSeed(): void {
    localStorage.removeItem(LOCAL_SEED_KEY)
}

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
