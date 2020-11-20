/**
 * Settings that stay fixed per-user.
 */
import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"
import * as settings from "../helpers/settings"

import type { Settings } from "../helpers/settings"

type SettingsFormProps = {
    value: Settings
    updateValue: (update: Partial<Settings>) => void
}

type GameTitleProps = {
    value: Settings["gameTitle"]
    onChange: (value: Settings["gameTitle"]) => void
}

type BadgeLevelProps = {
    value: Settings["badgeLevel"]
    onChange: (value: Settings["badgeLevel"]) => void
}

const renderRadioButton = <T extends string>(args: {
    name: string
    value: T
    onChange: (t: T) => void
}) => (variant: T, i: number) => (
    <label key={i} className={css(styles.radioLabel)}>
        <input
            type="radio"
            name={args.name}
            value={variant}
            checked={args.value === variant}
            onChange={() => args.onChange(variant)}
        />
        {variant}
    </label>
)

function GameTitle({ value, onChange }: GameTitleProps) {
    return (
        <fieldset className={css(styles.fieldset)}>
            <legend>Game</legend>
            {[settings.GameTitle.Sword, settings.GameTitle.Shield].map(
                renderRadioButton({
                    name: "settings-game-title",
                    value,
                    onChange,
                }),
            )}
        </fieldset>
    )
}

function BadgeLevel({ value, onChange }: BadgeLevelProps) {
    return (
        <fieldset style={styles.fieldset}>
            <legend>Show dens</legend>
            {[
                settings.BadgeLevel.All,
                settings.BadgeLevel.Adult,
                settings.BadgeLevel.Baby,
            ].map(
                renderRadioButton({
                    name: "settings-badge-level",
                    value,
                    onChange,
                }),
            )}
        </fieldset>
    )
}

export function SettingsForm({
    value,
    updateValue,
}: SettingsFormProps): JSX.Element {
    return (
        <div className={css(styles.settings)}>
            <GameTitle
                value={value.gameTitle}
                onChange={gameTitle => updateValue({ gameTitle })}
            />
            <BadgeLevel
                value={value.badgeLevel}
                onChange={badgeLevel => updateValue({ badgeLevel })}
            />
        </div>
    )
}

const styles = StyleSheet.create({
    settings: {
        display: "flex",
        marginBottom: 12,
    },
    fieldset: {
        display: "inline-flex",
    },
    radioLabel: {
        lineHeight: 1.4,
        marginRight: 12,
    },
})
