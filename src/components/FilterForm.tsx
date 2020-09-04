/**
 * Filters for frames.
 */
import * as React from "react"
import crate from "../../crate/Cargo.toml"
import * as den from "../helpers/den"

import type { AbilityFilter, ShinyFilter } from "../../crate/pkg/raidtomi"
import type { Filters } from "../helpers/filter"

type FilterFormProps = {
    value: Filters
    currentEncounter: den.DenEncounter | undefined
    updateValue: (update: Partial<Filters>) => void
}

type ShinyFilterProps = {
    value: Filters["shiny"]
    onChange: (value: Filters["shiny"]) => void
}

type AbilityFilterProps = {
    value: Filters["ability"]
    onChange: (value: Filters["ability"]) => void
}

const renderRadioButton = <T extends unknown>(args: {
    name: string
    value: T
    onChange: (t: T) => void
    getDOMValue: (t: T) => string
    getDisplayValue: (t: T) => string
}) => (variant: T, i: number) => {
    return (
        <label key={i}>
            <input
                type="radio"
                name={args.name}
                value={args.getDOMValue(variant)}
                checked={args.value === variant}
                onChange={() => args.onChange(variant)}
            />
            {args.getDisplayValue(variant)}
        </label>
    )
}

function ShinyFilterForm({ value, onChange }: ShinyFilterProps): JSX.Element {
    const shinyFilterToString = (filter: ShinyFilter | undefined) => {
        switch (filter) {
            case crate.ShinyFilter.Shiny:
                return "Shiny"
            case crate.ShinyFilter.Square:
                return "Square"
            default:
                return "Any"
        }
    }

    return (
        <fieldset>
            <legend>Shiny</legend>
            {[undefined, crate.ShinyFilter.Shiny, crate.ShinyFilter.Square].map(
                renderRadioButton({
                    name: "filter-shiny",
                    value,
                    onChange,
                    getDOMValue: shinyFilterToString,
                    getDisplayValue: shinyFilterToString,
                })
            )}
        </fieldset>
    )
}

function AbilityFilterForm({
    value,
    onChange,
}: AbilityFilterProps): JSX.Element {
    const abilityFilterToString = (filter: AbilityFilter | undefined) => {
        switch (filter) {
            case crate.AbilityFilter.First:
                return "First"
            case crate.AbilityFilter.Second:
                return "Second"
            case crate.AbilityFilter.Hidden:
                return "Hidden"
            default:
                return "Any"
        }
    }

    return (
        <fieldset>
            <legend>Ability</legend>
            {[
                undefined,
                crate.AbilityFilter.First,
                crate.AbilityFilter.Second,
                crate.AbilityFilter.Hidden,
            ].map(
                renderRadioButton({
                    name: "filter-ability",
                    value,
                    onChange,
                    getDOMValue: abilityFilterToString,
                    getDisplayValue: abilityFilterToString,
                })
            )}
        </fieldset>
    )
}

export function FilterForm({
    value,
    currentEncounter,
    updateValue,
}: FilterFormProps): JSX.Element {
    return (
        <div>
            <ShinyFilterForm
                value={value.shiny}
                onChange={shiny => updateValue({ shiny })}
            />
            <AbilityFilterForm
                value={value.ability}
                onChange={ability => updateValue({ ability })}
            />
        </div>
    )
}
