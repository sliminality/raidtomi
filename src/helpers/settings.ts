/**
 * General settings that won't change per-user too much.
 */

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
        badgeLevel: BadgeLevel.Adult,
    }
}
