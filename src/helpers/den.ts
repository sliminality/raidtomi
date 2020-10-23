import crate from "../../crate/Cargo.toml"
import * as species from "./species"
import * as settings from "./settings"
import { dens } from "./data/dens"

import type { Raid } from "../../crate/pkg/raidtomi"

//=============================================================================
// Types.
//=============================================================================

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
    minFlawlessIVs: 1 | 2 | 3 | 4 | 5
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

//=============================================================================
// Constructors.
//=============================================================================

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

//=============================================================================
// Encounters.
//=============================================================================

const getDenByIndex = (denIndex: number): Den | undefined => {
    return dens[denIndex]
}

/**
 * Filters all the entries corresponding to a specific badge level.
 */
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

/**
 * Formats an entry for display.
 */
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

//=============================================================================
// Gender.
//=============================================================================

/**
 * Returns the GenderPool corresponding to the given gender ratio.
 */
const getGenderPoolForRatio = (ratio: number): GenderPool => {
    switch (ratio) {
        case 0:
            return GenderPool.LockedMale
        case 254:
            return GenderPool.LockedFemale
        case 255:
            return GenderPool.LockedGenderless
        default: {
            if (ratio >= 0 && ratio < 256) {
                return GenderPool.Random
            }
        }
    }
    throw new Error(`Invalid gender ratio: ${ratio}`)
}

/**
 * Returns the final gender pool for the raid.
 *
 * There are two ways a raid encounter's gender can be determined: through the den
 * settings (DenEncounter.GenderPool), or the mon's gender ratio. First we check
 * the den settings, and if that is a random roll, we check the gender ratio.
 */
export const getGenderPoolForEncounter = (
    encounter: DenEncounter | undefined
): GenderPool | undefined => {
    if (!encounter) {
        return
    }

    // If encounter is not gender-locked, check if the mon itself is locked.
    if (encounter.genderPool === GenderPool.Random) {
        const { species, altForm } = encounter
        const personal = crate.get_personal_info(species, altForm)
        if (!personal) {
            throw new Error(
                `Invalid personal id: species ${species}, alt form ${altForm}`
            )
        }
        return getGenderPoolForRatio(personal.get_gender_ratio())
    }

    // For gender-locked encounters, no need to look up personal info.
    return encounter.genderPool
}
