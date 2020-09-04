/**
 * Logic for filtering frames based on stats.
 */
import crate from "../../crate/Cargo.toml"
import * as state from "../state"

import type { FrameFilter } from "../../crate/pkg/raidtomi"

export const createFilter = (filter: state.Filters): FrameFilter => {
    const ff = new crate.FrameFilter()
    if (filter.shiny !== undefined) {
        ff.set_shiny(filter.shiny)
    }
    if (filter.iv.some(Boolean)) {
        ff.set_ivs(...filter.iv)
    }
    if (filter.gender !== undefined) {
        ff.set_gender(filter.gender)
    }
    if (filter.ability !== undefined) {
        ff.set_ability(filter.ability)
    }
    return ff
}
