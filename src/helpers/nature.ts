import crate from "../../crate/Cargo.toml"

import type { Nature, NatureFilter } from "../../crate/pkg/raidtomi"

export type NatureFilterData = [
    hardy: boolean,
    lonely: boolean,
    brave: boolean,
    adamant: boolean,
    naughty: boolean,
    bold: boolean,
    docile: boolean,
    relaxed: boolean,
    impish: boolean,
    lax: boolean,
    timid: boolean,
    hasty: boolean,
    serious: boolean,
    jolly: boolean,
    naive: boolean,
    modest: boolean,
    mild: boolean,
    quiet: boolean,
    bashful: boolean,
    rash: boolean,
    calm: boolean,
    gentle: boolean,
    sassy: boolean,
    careful: boolean,
    quirky: boolean,
]

export const natures = [
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
] as const

export const NATURE_COUNT = natures.length

export function createNatureFilter(f: NatureFilterData): NatureFilter {
    // Transform bit vector into list of nature values.
    const natures = f.reduce(
        (acc: Array<number>, current: boolean, i: number) =>
            current ? [...acc, i] : acc,
        [],
    )
    return crate.NatureFilter.from_vec(new Uint32Array(natures))
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

/**
 * Immutably toggles the entry at the given index.
 */
export function toggleIndex(
    f: NatureFilterData,
    index: number,
): NatureFilterData {
    return f.map((isNatureEnabled, i) =>
        i === index ? !isNatureEnabled : isNatureEnabled,
    )
}

/**
 * Initialize a new filter with the given index enabled.
 */
export function createFilterDataForNature(nature: Nature): NatureFilterData {
    const empty: NatureFilterData = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
    ]
    empty[nature] = true
    return empty
}

/**
 * Given a preexisting filter, a nature, and a boolean, produce a new filter corresponding to enabling or disabling that nature.
 */
export function updateFilterData(
    value: NatureFilterData | undefined,
    nature: Nature,
    isEnabled: boolean,
): NatureFilterData | undefined {
    // If a value exists, toggle the given index.
    if (value) {
        const toggled = toggleIndex(value, nature)
        // Make sure at least one nature is enabled.
        return toggled.some(Boolean) ? toggled : undefined
    } else {
        // Handle no existing filter case.
        // Create a new filter only if the target is enabled, otherwise we should return undefined.
        return isEnabled ? createFilterDataForNature(nature) : undefined
    }
}
