/**
 * Filters for frames.
 */
import * as React from "react"
import crate from "../../crate/Cargo.toml"
import * as den from "../helpers/den"
import * as ability from "../helpers/ability"
import { Switcher } from "./Switcher"

import type { AbilityFilter, ShinyFilter } from "../../crate/pkg/raidtomi"
import type { AbilityName } from "../helpers/ability"
import type { Filters } from "../helpers/filter"
import type { GenderPool } from "../helpers/den"

type FilterFormProps = {
    value: Filters
    updateValue: (update: Partial<Filters>) => void
    currentEncounter: den.DenEncounter | undefined

    // Gender pool of the current den and encounter.
    // May be locked if the encounter or the species is gender-locked.
    // Determines which filters are valid.
    currentGenderPool: den.GenderPool | undefined
}

type ShinyFilterProps = {
    value: Filters["shiny"]
    onChange: (value: Filters["shiny"]) => void
}

type AbilityFilterProps = {
    value: Filters["ability"]
    abilityNames: [AbilityName, AbilityName, AbilityName] | undefined
    onChange: (value: Filters["ability"]) => void
}

type GenderFilterProps = {
    value: Filters["gender"]
    genderPool: GenderPool | undefined
    onChange: (value: Filters["gender"]) => void
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
    abilityNames,
    onChange,
}: AbilityFilterProps): JSX.Element {
    const getDOMValue = (filter: AbilityFilter | undefined) => {
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

    const getDisplayValue = (filter: AbilityFilter | undefined) => {
        switch (filter) {
            case crate.AbilityFilter.First:
                return abilityNames ? `${abilityNames[0]} (1)` : "First"
            case crate.AbilityFilter.Second:
                return abilityNames ? `${abilityNames[1]} (2)` : "Second"
            case crate.AbilityFilter.Hidden:
                return abilityNames ? `${abilityNames[2]} (HA)` : "Hidden"
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
                    getDOMValue,
                    getDisplayValue,
                })
            )}
        </fieldset>
    )
}

function GenderFilterForm({
    value,
    genderPool,
    onChange,
}: GenderFilterProps): JSX.Element {
    const isGenderLocked =
        genderPool === den.GenderPool.LockedGenderless ||
        genderPool === den.GenderPool.LockedMale ||
        genderPool === den.GenderPool.LockedFemale

    const switcherValue = (() => {
        // If pool is random, check the filter.
        if (genderPool === den.GenderPool.Random) {
            switch (value) {
                case crate.GenderFilter.Male:
                    return den.GenderPool.LockedMale
                case crate.GenderFilter.Female:
                    return den.GenderPool.LockedFemale
                default:
                    return den.GenderPool.Random // This is confusing, explain it.
            }
        } else {
            // If pool is locked, use the same value.
            return genderPool
        }
    })()

    const renderItemTitle = (item: GenderPool) => {
        switch (item) {
            case den.GenderPool.Random:
                return "Any"
            case den.GenderPool.LockedMale:
                return "Male ♂"
            case den.GenderPool.LockedFemale:
                return "Female ♀"
            case den.GenderPool.LockedGenderless:
                return "Genderless ∅"
        }
    }

    const getAriaItemLabel = (item: GenderPool) => {
        switch (item) {
            case den.GenderPool.Random:
                return "any gender"
            case den.GenderPool.LockedMale:
                return "male only"
            case den.GenderPool.LockedFemale:
                return "female only"
            case den.GenderPool.LockedGenderless:
                return "genderless only"
        }
    }

    const handleChange = (item: GenderPool | undefined) => {
        if (
            item === undefined ||
            item === den.GenderPool.Random ||
            item === den.GenderPool.LockedGenderless
        ) {
            onChange(undefined)
        } else if (item === den.GenderPool.LockedMale) {
            onChange(crate.GenderFilter.Male)
        } else if (item === den.GenderPool.LockedFemale) {
            onChange(crate.GenderFilter.Female)
        }
    }

    return (
        <fieldset>
            <legend>Gender</legend>
            <Switcher<GenderPool>
                allowDeselect={true}
                value={switcherValue}
                items={[
                    {
                        item: den.GenderPool.Random,
                        disabled: isGenderLocked,
                    },
                    {
                        item: den.GenderPool.LockedMale,
                        disabled: isGenderLocked,
                    },
                    {
                        item: den.GenderPool.LockedFemale,
                        disabled: isGenderLocked,
                    },
                    {
                        item: den.GenderPool.LockedGenderless,
                        disabled: true,
                    },
                ]}
                onChange={handleChange}
                renderItemTitle={renderItemTitle}
                getItemAriaLabel={getAriaItemLabel}
            />
        </fieldset>
    )
}

export function FilterForm({
    value,
    currentEncounter,
    currentGenderPool,
    updateValue,
}: FilterFormProps): JSX.Element {
    const abilityNames = React.useMemo(
        () => ability.getAbilitiesForEntry(currentEncounter),
        [currentEncounter]
    )

    return (
        <div>
            <ShinyFilterForm
                value={value.shiny}
                onChange={shiny => updateValue({ shiny })}
            />
            <AbilityFilterForm
                value={value.ability}
                abilityNames={abilityNames}
                onChange={ability => updateValue({ ability })}
            />
            <GenderFilterForm
                value={value.gender}
                genderPool={currentGenderPool}
                onChange={gender => updateValue({ gender })}
            />
        </div>
    )
}
