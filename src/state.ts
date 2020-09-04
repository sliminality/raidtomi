/**
 * State for the application.
 */
import crate from "../crate/Cargo.toml"
import * as filter from "./helpers/filter"

import type {
    SingleIVFilter,
    IVJudgment,
    AbilityFilter,
    GenderFilter,
    ShinyFilter,
} from "../crate/pkg/raidtomi"
import type { Filters } from "./helpers/filter"
import type { DenEncounter } from "./helpers/den"

export type State = {
    raid: Raid
    filters: Filters
    settings: Settings
}

export function createDefaultState(): State {
    return {
        raid: createDefaultRaid(),
        filters: filter.createDefaultFilters(),
        settings: createDefaultSettings(),
    }
}

/**********************************************************
 * Settings.
 **********************************************************/

export const enum GameTitle {
    Sword = "Sword",
    Shield = "Shield",
}

// Which star levels will be visible.
export const enum BadgeLevel {
    All = "All",
    Baby = "Baby",
    Adult = "Adult",
}

export type Settings = {
    gameTitle: GameTitle
    badgeLevel: BadgeLevel
}

export function createDefaultSettings(): Settings {
    return {
        gameTitle: GameTitle.Sword,
        badgeLevel: BadgeLevel.All,
    }
}

/**********************************************************
 * Raid.
 **********************************************************/

export type Raid = {
    den: number
    entryIndex: number
}

export function createDefaultRaid(): State["raid"] {
    return {
        den: 1,
        entryIndex: 0,
    }
}
