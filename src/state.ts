/**
 * State for the application.
 */
import crate from "../crate/Cargo.toml"

import type { DenEncounter } from "./helpers/den"
import type {
    SingleIVFilter,
    IVJudgment,
    AbilityFilter,
    GenderFilter,
    ShinyFilter,
} from "../crate/pkg/raidtomi"

export type State = {
    raid: Raid
    filters: Filters
    settings: Settings
}

export function createDefaultState(): State {
    return {
        raid: createDefaultRaid(),
        filters: createDefaultFilters(),
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

/**********************************************************
 * Filters.
 **********************************************************/

export type Filters = {
    shiny: ShinyFilter | undefined
    iv: [
        SingleIVFilter | undefined,
        SingleIVFilter | undefined,
        SingleIVFilter | undefined,
        SingleIVFilter | undefined,
        SingleIVFilter | undefined,
        SingleIVFilter | undefined
    ]
    ability: AbilityFilter | undefined
    gender: GenderFilter | undefined
}

export function createDefaultFilters(): Filters {
    return {
        shiny: crate.ShinyFilter.Shiny,
        iv: [undefined, undefined, undefined, undefined, undefined, undefined],
        ability: undefined,
        gender: undefined,
    }
}
