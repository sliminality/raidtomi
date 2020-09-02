/**
 * Filters for frames.
 */
import * as React from "react"

import type { Filters } from "../state"

type FiltersProps = {
    value: Filters
    mon: { species: number; form: number } | undefined
    updateValue: React.Dispatch<React.SetStateAction<Filters>>
}

export function Filters(props: FiltersProps) {
    return <div>filter</div>
}
