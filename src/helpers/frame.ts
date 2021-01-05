import crate from "../../crate/Cargo.toml"

import * as seedHelpers from "./seed"
import * as natureHelpers from "./nature"

import type {
    Ability,
    Frame,
    Gender,
    Nature,
    Shininess,
} from "../../crate/pkg/raidtomi"

export { formatNature } from "./nature"

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
        seed: seedHelpers.convert.instance.toString(frame.get_seed()),
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
        nature: natureHelpers.natures[frame.nature],
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

export function formatShiny(shiny: Shininess): string {
    switch (shiny) {
        case crate.Shininess.None:
            return "-"
        case crate.Shininess.Star:
            return "⭐️"
        case crate.Shininess.Square:
            return "🔶"
        default:
            return undefined as never
    }
}
