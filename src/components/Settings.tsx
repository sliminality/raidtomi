/**
 * Settings that stay fixed per-user.
 */
import * as React from "react"
import { GameTitle } from "../state"

import type { Settings } from "../state"

type SettingsProps = {
    value: Settings
    updateValue: (update: Partial<Settings>) => void
}

export function Settings({ value, updateValue }: SettingsProps) {
    const handleClick = () =>
        updateValue({
            ...value,
            gameTitle: GameTitle.Shield,
        })

    return (
        <div>
            settings
            <button onClick={handleClick}>Update settings</button>
        </div>
    )
}
