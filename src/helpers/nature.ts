import crate from "../../crate/Cargo.toml"

import type { NatureFilter } from "../../crate/pkg/raidtomi"

export type NatureFilterData = [
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
]

export function createNatureFilter(f: NatureFilterData): NatureFilter {
    // Transform bit vector into list of nature values.
    const natures = f.reduce(
        (acc: Array<number>, current: boolean, i: number) =>
            current ? [...acc, i] : acc,
        [],
    )
    return crate.NatureFilter.from_vec(new Uint32Array(natures))
}
