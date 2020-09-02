/**
 * Settings that stay fixed per-user.
 */
import * as React from "react"

import type { Settings } from "../state"

type SettingsProps = {
    value: Settings
    updateValue: React.Dispatch<React.SetStateAction<Settings>>
}

export function Settings(props: SettingsProps) {
    return <div>settings</div>
}
