/**
 * Den and mon selection.
 */
import * as React from "react"

import type { Raid, Settings } from "../state"

type RaidProps = {
    value: Raid
    settings: Settings
    updateValue: (update: Partial<Raid>) => void
}

export function Raid(props: RaidProps) {
    return <div>raid</div>
}
