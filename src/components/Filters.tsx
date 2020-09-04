/**
 * Filters for frames.
 */
import * as React from "react"
import * as den from "../helpers/den"

import type { Filters } from "../helpers/filter"

type FiltersProps = {
    value: Filters
    currentEncounter: den.DenEncounter | undefined
    updateValue: (update: Partial<Filters>) => void
}

export function Filters(props: FiltersProps) {
    return <div>filter</div>
}
