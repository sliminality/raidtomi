/**
 * Filters for frames.
 */
import * as React from "react"
import * as den from "../helpers/den"

import type { Filters } from "../helpers/filter"

type FilterFormProps = {
    value: Filters
    currentEncounter: den.DenEncounter | undefined
    updateValue: (update: Partial<Filters>) => void
}

export function FilterForm(props: FilterFormProps): JSX.Element {
    return <div>filter</div>
}
