/**
 * Den and mon selection.
 */
import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"
import * as den from "../helpers/den"
import { dens } from "../helpers/data/dens"

import type { DenEncounter, RaidData } from "../helpers/den"

type RaidFormProps = {
    value: RaidData
    encounters: Array<DenEncounter>
    updateValue: (update: Partial<RaidData>) => void
}

type DenPickerProps = {
    value: RaidData["den"]
    onChange: (value: number) => void
}

function DenPicker({ value, onChange }: DenPickerProps) {
    const MAX_DEN_INDEX = dens.length
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
    const handleBlur = () => {
        setInvalidState(undefined)
    }

    return (
        <label className={css(styles.label)}>
            Den
            <input
                type="number"
                min={1}
                max={MAX_DEN_INDEX}
                onChange={handleChange}
                onBlur={handleBlur}
                value={invalidState ? invalidState.temporaryValue : value}
                size={3}
            />
            {invalidState && invalidState.message}
        </label>
    )
}

export function RaidForm({
    value,
    encounters,
    updateValue,
}: RaidFormProps): JSX.Element {
    const handleDenChange = (update: number) => {
        updateValue({ den: update })
    }
    const handleEncounterSelectChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        updateValue({ entryIndex: parseInt(e.currentTarget.value, 10) })
    }

    return (
        <div className={css(styles.wrapper)}>
            <div className={css(styles.form)}>
                <DenPicker value={value.den} onChange={handleDenChange} />
                <label className={css(styles.label)}>
                    Encounter
                    <select
                        className={css(styles.encounterSelect)}
                        name="encounter"
                        value={value.entryIndex}
                        onChange={handleEncounterSelectChange}
                    >
                        {encounters.map((entry, i) => (
                            <option key={i} value={i}>
                                {den.formatEntry(entry)}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </div>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        display: "flex",
        alignItems: "flex-start",
        flexDirection: "column" as const,
    },
    label: {
        display: "inline-flex",
        alignItems: "center",
    },
    form: {
        marginRight: 8,
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
    },
    encounterSelect: {
        marginLeft: 8,
    },
})
