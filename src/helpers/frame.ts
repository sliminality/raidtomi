import crate from "../../crate/Cargo.toml"

import type {
    Ability,
    Frame,
    Gender,
    Nature,
    Seed,
    Shininess,
} from "../../crate/pkg/raidtomi"

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

export interface FrameResult {
    skips: number
    shiny: Shininess
    ivs: [number, number, number, number, number, number]
    ability: Ability
    gender: Gender
    nature: Nature
    seed: string
}

export function createFrame(skips: number, frame: Frame): FrameResult {
    return {
        skips,
        seed: formatSeed(frame.get_seed()),
        ability: [
            crate.Ability.First,
            crate.Ability.Second,
            crate.Ability.Hidden,
        ][frame.ability],
        gender: [
            crate.Gender.Male,
            crate.Gender.Female,
            crate.Gender.Genderless,
        ][frame.gender],
        ivs: [
            frame.ivs[0],
            frame.ivs[1],
            frame.ivs[2],
            frame.ivs[3],
            frame.ivs[4],
            frame.ivs[5],
        ],
        nature: [
            crate.Nature.Hardy,
            crate.Nature.Lonely,
            crate.Nature.Brave,
            crate.Nature.Adamant,
            crate.Nature.Naughty,
            crate.Nature.Bold,
            crate.Nature.Docile,
            crate.Nature.Relaxed,
            crate.Nature.Impish,
            crate.Nature.Lax,
            crate.Nature.Timid,
            crate.Nature.Hasty,
            crate.Nature.Serious,
            crate.Nature.Jolly,
            crate.Nature.Naive,
            crate.Nature.Modest,
            crate.Nature.Mild,
            crate.Nature.Quiet,
            crate.Nature.Bashful,
            crate.Nature.Rash,
            crate.Nature.Calm,
            crate.Nature.Gentle,
            crate.Nature.Sassy,
            crate.Nature.Careful,
            crate.Nature.Quirky,
        ][frame.nature],
        shiny: [
            crate.Shininess.None,
            crate.Shininess.Star,
            crate.Shininess.Square,
        ][frame.shiny],
    }
}

export function formatAbility(
    ability: Ability,
    short: boolean = false,
): string {
    switch (ability) {
        case crate.Ability.First:
            return short ? "1" : "First"
        case crate.Ability.Second:
            return short ? "2" : "Second"
        case crate.Ability.Hidden:
            return short ? "H" : "Hidden"
        default:
            return undefined as never
    }
}

export function formatGender(gender: Gender): string {
    switch (gender) {
        case crate.Gender.Male:
            return "M"
        case crate.Gender.Female:
            return "F"
        case crate.Gender.Genderless:
            return "-"
        default:
            return undefined as never
    }
}

export function formatNature(nature: Nature): string {
    return [
        "Hardy",
        "Lonely",
        "Brave",
        "Adamant",
        "Naughty",
        "Bold",
        "Docile",
        "Relaxed",
        "Impish",
        "Lax",
        "Timid",
        "Hasty",
        "Serious",
        "Jolly",
        "Naive",
        "Modest",
        "Mild",
        "Quiet",
        "Bashful",
        "Rash",
        "Calm",
        "Gentle",
        "Sassy",
        "Careful",
        "Quirky",
    ][nature]
}

export function formatShiny(shiny: Shininess): string {
    switch (shiny) {
        case crate.Shininess.None:
            return "-"
        case crate.Shininess.Star:
            return "⭐️"
        case crate.Shininess.Square:
            return "✴️"
        default:
            return undefined as never
    }
}
