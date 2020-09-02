/**
 * Den and mon selection.
 */
import * as React from "react"

import type { Raid, Settings } from "../state"

type RaidProps = {
    value: Raid
    settings: Settings
    updateValue: React.Dispatch<React.SetStateAction<Raid>>
}

export function Raid(props: RaidProps) {
    return <div>raid</div>
}
