import crate from "../../crate/Cargo.toml"
import * as species from "./species"
import * as settings from "./settings"
import { dens } from "./data/dens"

import type { Raid } from "../../crate/pkg/raidtomi"

export type RaidData = {
    den: number
    entryIndex: number
}

export function createDefaultRaid(): RaidData {
    return {
        den: 1,
        entryIndex: 0,
    }
}

export type DenEncounter = {
    species: number // National Dex number.
    altForm: number // Index of alt form. 0 is base form.
    minFlawlessIVs: 1 | 2 | 3 | 4
    abilityPool: 0 | 1 | 2 | 3 | 4
    genderPool: 0 | 1 | 2 | 3
    isGmax: boolean
    stars: [boolean, boolean, boolean, boolean, boolean]
}

export type Den = {
    id: string
    sw: Array<DenEncounter> // Sword entries.
    sh: Array<DenEncounter> // Shield entries.
}

export const enum AbilityPool {
    Random = 4,
    RandomNoHA = 3,
    FixedHA = 2,
    FixedSecond = 1,
    FixedFirst = 0,
}

export const enum GenderPool {
    Random = 0,
    LockedMale = 1,
    LockedFemale = 2,
    LockedGenderless = 3,
}

export function createRaid(encounter: DenEncounter): Raid {
    return new crate.Raid(
        encounter.species,
        encounter.altForm,
        encounter.minFlawlessIVs,
        encounter.isGmax,
        encounter.abilityPool,
        encounter.genderPool
    )
}

const getDenByIndex = (denIndex: number): Den | undefined => {
    return dens[denIndex]
}

const getEntriesForBadgeLevel = (badgeLevel: settings.BadgeLevel) => (
    entries: Array<DenEncounter>
): Array<DenEncounter> => {
    const filterEntry = (predicate: (index: number) => boolean) => (
        entry: DenEncounter
    ): boolean =>
        entry.stars
            .map((isPresent, starCount) => (isPresent ? starCount : undefined))
            .filter(
                starCount =>
                    typeof starCount === "number" && predicate(starCount)
            ).length > 0

    switch (badgeLevel) {
        case settings.BadgeLevel.All: {
            return entries
        }
        // 1-2 stars.
        case settings.BadgeLevel.Baby: {
            return entries.filter(filterEntry(starCount => starCount < 2))
        }
        // 3-5 stars.
        case settings.BadgeLevel.Adult: {
            return entries.filter(filterEntry(starCount => starCount >= 2))
        }
    }
}

const getEntriesForTitle = (
    title: settings.GameTitle,
    den: Den
): Array<DenEncounter> => {
    switch (title) {
        case settings.GameTitle.Sword:
            return den.sw
        case settings.GameTitle.Shield:
            return den.sh
    }
}

export const getEntriesForSettings = (settings: settings.Settings) => (
    denIndex: number
): Array<DenEncounter> | undefined => {
    const den = getDenByIndex(denIndex)
    if (!den) {
        return
    }
    return getEntriesForBadgeLevel(settings.badgeLevel)(
        getEntriesForTitle(settings.gameTitle, den)
    )
}

export function getCurrentRaidEntry(
    raid: RaidData,
    settings: settings.Settings
): DenEncounter | undefined {
    const entries = getEntriesForSettings(settings)(raid.den)
    if (!entries) {
        return
    }
    return entries[raid.entryIndex]
}

export const formatEntry = (entry: DenEncounter): string => {
    const speciesName = species.getSpeciesName(entry.species)
    const form = entry.altForm > 0 ? entry.altForm : "" // TODO: Map these to names.
    const gender = (() => {
        switch (entry.genderPool) {
            case GenderPool.LockedMale:
                return "(M)"
            case GenderPool.LockedFemale:
                return "(F)"
            default:
                return ""
        }
    })()
    return [speciesName, form, gender].join(" ").trim()
}
