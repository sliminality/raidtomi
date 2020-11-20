/**
 * Den and mon selection.
 */
import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"
import * as den from "../helpers/den"
import { dens } from "../helpers/data/dens"
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
        <ul className={css(styles.denPreviewList)}>
            {encounters.map((entry, i) => {
                return (
                    <li key={i}>
                        <button
                            className={css(
                                styles.denPreviewListEntry,
                                i === hoveredIndex &&
                                    styles.denPreviewListEntryHover,
                                i === value && styles.denPreviewListEntryActive,
                            )}
                            onClick={() => onChange(i)}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={resetHoveredIndex}
                        >
                            <Sprite
                                type="species"
                                species={entry.species}
                                isStandalone={false}
                                className={css(styles.denPreviewSprite)}
                            />
                            {den.formatEntry(entry)}
                            <span
                                className={css(styles.minFlawlessIVs)}
                            >{`${entry.minFlawlessIVs}IV+`}</span>
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
        [value.den, settings],
    )

    const handleEncounterSelectChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        updateValue({ entryIndex: parseInt(e.currentTarget.value, 10) })
    }
    const handleDenPreviewChange = (index: number) => {
        updateValue({ entryIndex: index })
    }

    return (
        <div className={css(styles.wrapper)}>
            <div className={css(styles.form)}>
                <DenPicker value={value.den} onChange={handleDenChange} />
                <label className={css(styles.label)}>
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
    denPreviewList: {
        listStyleType: "none",
        margin: "12px 0",
        padding: 0,
        display: "flex",
        flexWrap: "wrap" as const,
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
        background: "var(--light-blue)",
    },
    denPreviewListEntryHover: {
        background: "rgba(var(--blue-base), 0.1)",
    },
    denPreviewSprite: {
        marginBottom: 8,
    },
    minFlawlessIVs: {
        color: "var(--light-text-color)",
        fontSize: 12,
        marginTop: 4,
    },
})
