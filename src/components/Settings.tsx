/**
 * Settings that stay fixed per-user.
 */
import * as React from "react"

import type { Settings } from "../state"

type SettingsProps = {
    value: Settings
    updateValue: (update: Partial<Settings>) => void
}

export function Settings(props: SettingsProps) {
    return <div>settings</div>
}
