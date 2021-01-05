/**
 * Filters for nature.
 */
import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"
import crate from "../../crate/Cargo.toml"
import * as natureHelpers from "../helpers/nature"

import type { Nature } from "../../crate/pkg/raidtomi"
import type { Filters } from "../helpers/filter"

type NatureFilterProps = {
    value: Filters["nature"]
    // TODO: Implement nature pool for Toxtricity.
    onChange: (value: Filters["nature"]) => void
}

export function NatureFilter({
    value,
    onChange,
}: NatureFilterProps): JSX.Element {
    const handleToggleNature = React.useCallback(
        (nature: Nature) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const updatedValue = natureHelpers.updateFilterData(
                value,
                nature,
                // Determine whether we enabled or disabled the target.
                e.currentTarget.checked,
            )
            onChange(updatedValue)
        },
        [value, onChange],
    )

    return (
        <fieldset className={css(styles.scrollContainer)}>
            <legend>Nature</legend>
            <ul className={css(styles.natureList)}>
                {natureHelpers.natures.map((nature, index) => {
                    const formatted = natureHelpers.formatNature(nature)
                    const id = `filter-nature-${formatted.toLowerCase()}`
                    return (
                        <li key={index} className={css(styles.listItem)}>
                            <input
                                type="checkbox"
                                id={id}
                                name="filter-nature"
                                value={nature.toString()}
                                checked={value && value[nature]}
                                onChange={handleToggleNature(nature)}
                            />
                            <label htmlFor={id}>{formatted}</label>
                        </li>
                    )
                })}
            </ul>
        </fieldset>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        width: "100%",
        border: "1px solid var(--light-divider-color)",
        paddingLeft: 8,
        paddingRight: 12,
        paddingBottom: 8,

        "@media (min-width: 800px)": {
            maxHeight: 300,
            overflowY: "scroll",
            width: "auto",
        },
    },
    natureList: {
        listStyleType: "none",
        margin: 0,
        padding: 0,
        fontSize: 14,
        lineHeight: 1.4,

        display: "grid",
        gridTemplateColumns: "1fr 1fr",

        "@media (min-width: 400px)": {
            gridTemplateColumns: "1fr 1fr 1fr",
        },

        "@media (min-width: 800px)": {
            display: "block",
        },
    },
    listItem: {
        display: "flex",
    },
})
