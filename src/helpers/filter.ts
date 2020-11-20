/**
 * Logic for filtering frames based on stats.
 */
import crate from "../../crate/Cargo.toml"

import type {
    FrameFilter,
    ShinyFilter,
    AbilityFilter,
    GenderFilter,
    IVJudgment,
    RangeDirection,
    SingleIVFilter,
} from "../../crate/pkg/raidtomi"

// We need a serializable representation of SingleIVFilter, since the crate import
// is memory-managed by Rust.
export type SingleIVFilterData = {
    judgment: IVJudgment
    direction: RangeDirection
}

export type Filters = {
    shiny: ShinyFilter | undefined
    iv: [
        SingleIVFilterData | undefined,
        SingleIVFilterData | undefined,
        SingleIVFilterData | undefined,
        SingleIVFilterData | undefined,
        SingleIVFilterData | undefined,
        SingleIVFilterData | undefined,
    ]
    ability: AbilityFilter | undefined
    gender: GenderFilter | undefined
}

export function createDefaultFilters(): Filters {
    return {
        shiny: crate.ShinyFilter.Square,
        iv: [
            undefined,
            undefined,
            // e.g. 0 attack:
            // {
            //     judgment: crate.IVJudgment.NoGood,
            //     direction: crate.RangeDirection.AtMost,
            // },
            undefined,
            undefined,
            undefined,
            undefined,
        ],
        ability: undefined,
        gender: undefined,
    }
}

const createSingleIVFilter = (
    f: SingleIVFilterData | undefined,
): SingleIVFilter | undefined => {
    if (!f) {
        return f
    }
    return f.direction === crate.RangeDirection.AtLeast
        ? crate.SingleIVFilter.new_at_least(f.judgment)
        : crate.SingleIVFilter.new_at_most(f.judgment)
}

export const createFilter = (filter: Filters): FrameFilter => {
    const ff = new crate.FrameFilter()
    if (filter.shiny !== undefined) {
        ff.set_shiny(filter.shiny)
    }
    if (filter.iv.some(Boolean)) {
        ff.set_ivs(...filter.iv.map(createSingleIVFilter))
    }
    if (filter.gender !== undefined) {
        ff.set_gender(filter.gender)
    }
    if (filter.ability !== undefined) {
        ff.set_ability(filter.ability)
    }
    return ff
}
