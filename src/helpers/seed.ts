import crate from "../../crate/Cargo.toml"

import type { Seed } from "../../crate/pkg/raidtomi"

export const MAX_VALID_SEED = BigInt("0xFFFFFFFFFFFFFFFF")

const LOCAL_SEED_KEY = "seed"

export function createDefaultSeed(): BigInt {
    const defaultSeed = BigInt("0xbb810e6006a2a035")
    const serializedSeed = localStorage.getItem(LOCAL_SEED_KEY)
    if (serializedSeed) {
        let parsed: BigInt
        try {
            parsed = convert.string.toBigInt(serializedSeed)
        } catch (error) {
            parsed = defaultSeed
        }
        return parsed
    }
    return defaultSeed
}

export function saveSeed(seed: BigInt): void {
    localStorage.setItem(LOCAL_SEED_KEY, convert.bigInt.toString(seed))
}

export function clearSavedSeed(): void {
    localStorage.removeItem(LOCAL_SEED_KEY)
}

export const convert = {
    string: {
        toBigInt: (value: string): BigInt => {
            return BigInt(`0x${value}`)
        },
        toInstance: (value: string): Seed => {
            return crate.Seed.from_u64(convert.string.toBigInt(value))
        },
    },
    bigInt: {
        toString: (value: BigInt): string => {
            return value.toString(16)
        },
        toInstance: (value: BigInt): Seed => {
            return crate.Seed.from_u64(value)
        },
    },
    instance: {
        toString: (value: Seed): string => {
            return convert.bigInt.toString(convert.instance.toBigInt(value))
        },
        /**
         * Reassemble a Seed object into a 64-bit BigInt.
         *
         * wasm-opt has trouble optimizing u64 types, so we can't expose a u64 directly
         * from Rust. In order to pass seeds across the boundary, we store them as two
         * u32 values, and put them back together in JavaScript.
         */
        toBigInt: (value: Seed): BigInt => {
            // Left-shift the first 32 bits to make room to add the next 32 bits.
            return (BigInt(value[0]) << BigInt(32)) + BigInt(value[1])
        },
    },
}
