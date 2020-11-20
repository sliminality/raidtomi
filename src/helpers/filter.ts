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

const LOCAL_FILTER_KEY = "filter"

export function createDefaultFilters(): Filters {
    const serializedFilters = localStorage.getItem(LOCAL_FILTER_KEY)
    if (serializedFilters) {
        const parsed = JSON.parse(serializedFilters)

        // Fix nulls.
        return {
            shiny: parsed.shiny === null ? undefined : parsed.shiny,
            iv: parsed.iv.map((iv: SingleIVFilterData | null) =>
                iv === null ? undefined : iv,
            ),
            ability: parsed.ability === null ? undefined : parsed.ability,
            gender: parsed.gender === null ? undefined : parsed.gender,
        }
    }
    return {
        shiny: crate.ShinyFilter.Shiny,
        iv: [undefined, undefined, undefined, undefined, undefined, undefined],
        ability: undefined,
        gender: undefined,
    }
}

export function saveFilters(filters: Filters): void {
    localStorage.setItem(LOCAL_FILTER_KEY, JSON.stringify(filters))
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
