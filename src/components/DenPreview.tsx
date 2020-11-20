import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"
import * as den from "../helpers/den"
import { Sprite } from "./Sprite"

type DenPreviewProps = {
    value: number
    encounters: Array<den.DenEncounter>
    onChange: (value: number) => void
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

const styles = StyleSheet.create({
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
