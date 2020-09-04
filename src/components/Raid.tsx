/**
 * Den and mon selection.
 */
import * as React from "react"
import * as den from "../helpers/den"
import { GameTitle } from "../state"

import type { Raid, Settings } from "../state"

type RaidProps = {
    value: Raid
    settings: Settings
    updateValue: (update: Partial<Raid>) => void
}

type DenPickerProps = {
    value: Raid["den"]
    onChange: (value: number) => void
}

function DenPicker({ value, onChange }: DenPickerProps) {
    const MAX_DEN_INDEX = 157
    const [invalidState, setInvalidState] = React.useState<
        | {
              temporaryValue: string
              message?: string
          }
        | undefined
    >()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // If the user deletes the value with the keyboard, don't show an error.
        if (e.currentTarget.value === "") {
            setInvalidState({
                temporaryValue: "",
            })
            return
        }
        const update = parseInt(e.currentTarget.value, 10)
        if (!update || update > MAX_DEN_INDEX) {
            setInvalidState({
                temporaryValue: e.currentTarget.value,
                message: "Invalid den",
            })
            return
        }
        onChange(update)
        setInvalidState(undefined)
    }
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setInvalidState(undefined)
    }

    return (
        <label style={styles.label}>
            Den
            <input
                type="number"
                min={1}
                max={MAX_DEN_INDEX}
                onChange={handleChange}
                onBlur={handleBlur}
                value={invalidState ? invalidState.temporaryValue : value}
            />
            {invalidState && invalidState.message}
        </label>
    )
}

export function Raid({ value, settings, updateValue }: RaidProps) {
    const handleDenChange = (update: number) => {
        updateValue({ den: update })
    }

    const encounters = React.useMemo(
        () => den.getEntriesForSettings(settings)(value.den) || [],
        [value.den, settings]
    )

    const handleEncounterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateValue({ entryIndex: parseInt(e.currentTarget.value, 10) })
    }

    return (
        <div>
            raid
            <DenPicker value={value.den} onChange={handleDenChange} />
            <label style={styles.label}>
                Encounter
                <select name="encounter" onChange={handleEncounterChange}>
                    {encounters.map((entry, i) => (
                        <option key={i} value={i}>
                            {den.formatEntry(entry)}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    )
}

const styles = {
    label: {
        display: "flex",
    },
}
