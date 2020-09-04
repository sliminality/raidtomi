/**
 * Den and mon selection.
 */
import * as React from "react"
import * as den from "../helpers/den"
import { Sprite } from "./Sprite"

import type { RaidData } from "../helpers/den"
import type { Settings } from "../helpers/settings"

type RaidFormProps = {
    value: RaidData
    settings: Settings
    updateValue: (update: Partial<RaidData>) => void
}

type DenPickerProps = {
    value: RaidData["den"]
    onChange: (value: number) => void
}

type DenPreviewProps = {
    value: number
    encounters: Array<den.DenEncounter>
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
    const handleBlur = () => {
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

export function DenPreview({
    encounters,
    onChange,
    value,
}: DenPreviewProps): JSX.Element {
    const [hoveredIndex, setHoveredIndex] = React.useState<number | undefined>()

    const resetHoveredIndex = () => {
        setHoveredIndex(undefined)
    }

    // TODO: Handle female sprites.
    // TODO: Handle form sprites.
    return (
        <ul style={styles.denPreviewList}>
            {encounters.map((entry, i) => {
                const style = {
                    ...styles.denPreviewListEntry,
                    ...(i === hoveredIndex && styles.denPreviewListEntryHover),
                    ...(i === value && styles.denPreviewListEntryActive),
                }
                return (
                    <li key={i}>
                        <button
                            style={style}
                            onClick={() => onChange(i)}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={resetHoveredIndex}
                        >
                            <Sprite
                                type="species"
                                species={entry.species}
                                isStandalone={false}
                                style={styles.denPreviewSprite}
                            />
                            {den.formatEntry(entry)}
                        </button>
                    </li>
                )
            })}
        </ul>
    )
}

export function RaidForm({
    value,
    settings,
    updateValue,
}: RaidFormProps): JSX.Element {
    const handleDenChange = (update: number) => {
        updateValue({ den: update })
    }

    const encounters = React.useMemo(
        () => den.getEntriesForSettings(settings)(value.den) || [],
        [value.den, settings]
    )

    const handleEncounterSelectChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        updateValue({ entryIndex: parseInt(e.currentTarget.value, 10) })
    }
    const handleDenPreviewChange = (index: number) => {
        updateValue({ entryIndex: index })
    }

    return (
        <div style={styles.wrapper}>
            <div style={styles.form}>
                <DenPicker value={value.den} onChange={handleDenChange} />
                <label style={styles.label}>
                    Encounter
                    <select
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
            <DenPreview
                value={value.entryIndex}
                encounters={encounters}
                onChange={handleDenPreviewChange}
            />
        </div>
    )
}

const styles = {
    wrapper: {
        display: "flex",
        justifyContent: "space-between",
    },
    label: {
        display: "flex",
    },
    form: {
        marginRight: 8,
        width: "40%",
        maxWidth: 400,
    },
    denPreviewList: {
        listStyleType: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexWrap: "wrap" as const,
        width: "60%",
        justifyContent: "center",
    },
    denPreviewListEntry: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        background: "none",
        border: "none",
        borderRadius: 4,
        fontSize: 14,
        padding: 6,
        width: 92,
        marginBottom: 8,
        marginRight: 8,
    },
    denPreviewListEntryActive: {
        background: "rgba(0, 0, 150, 0.1)",
    },
    denPreviewListEntryHover: {
        background: "rgba(0, 0, 0, 0.1)",
    },
    denPreviewSprite: {
        marginBottom: 8,
    },
}
