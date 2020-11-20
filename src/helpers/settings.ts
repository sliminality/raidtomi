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

const LOCAL_SETTINGS_KEY = "settings"

export function createDefaultSettings(): Settings {
    const serializedSettings = localStorage.getItem(LOCAL_SETTINGS_KEY)
    if (serializedSettings) {
        return JSON.parse(serializedSettings)
    }
    return {
        gameTitle: GameTitle.Sword,
        badgeLevel: BadgeLevel.Adult,
    }
}

export function saveSettings(settings: Settings): void {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings))
}
