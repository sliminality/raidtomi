/**
 * Filters for frames.
 */
import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"
import crate from "../../crate/Cargo.toml"
import { Switcher } from "./Switcher"
import { ScreenReaderText } from "./ScreenReaderText"

import type { IVJudgment, RangeDirection } from "../../crate/pkg/raidtomi"
import type { Filters, SingleIVFilterData } from "../helpers/filter"

const ANY = "Any"
type AnyOption = typeof ANY

type SingleIVFilterProps = {
    name: string
    value: SingleIVFilterData | undefined
    onChange: (value: SingleIVFilterData | undefined) => void
}

function SingleIVFilter({
    name,
    value,
    onChange,
}: SingleIVFilterProps): JSX.Element {
    const renderItemTitle = React.useCallback(
        (item: RangeDirection | AnyOption) => {
            switch (item) {
                case crate.RangeDirection.AtLeast:
                    return "At least"
                case crate.RangeDirection.AtMost:
                    return "At most"
                case ANY:
                    return "Any"
            }
        },
        [],
    )

    const getAriaItemLabel = React.useCallback(
        (item: RangeDirection | AnyOption) => {
            switch (item) {
                case crate.RangeDirection.AtLeast:
                    return "at least"
                case crate.RangeDirection.AtMost:
                    return "at most"
                case ANY:
                    return "any"
                default:
                    return unreachable()
            }
        },
        [],
    )

    const formatJudgment = React.useCallback((judgment: IVJudgment | "-") => {
        switch (judgment) {
            case "-":
                return "-"
            case crate.IVJudgment.Best:
                return "Best (31)"
            case crate.IVJudgment.Fantastic:
                return "Fantastic (30)"
            case crate.IVJudgment.VeryGood:
                return "Very Good (26-29)"
            case crate.IVJudgment.PrettyGood:
                return "Pretty Good (16-24)"
            case crate.IVJudgment.Decent:
                return "Decent (1-15)"
            case crate.IVJudgment.NoGood:
                return "No Good (0)"
            default:
                return unreachable()
        }
    }, [])

    const handleRangeDirectionChange = React.useCallback(
        (direction: RangeDirection | AnyOption) => {
            if (direction === ANY) {
                onChange(undefined)
                return
            } else if (direction === crate.RangeDirection.AtMost) {
                onChange([
                    direction,
                    // If setting to At Most, default to No Good.
                    value === undefined ? crate.IVJudgment.NoGood : value[1],
                ])
                return
            } else if (direction === crate.RangeDirection.AtLeast) {
                onChange([
                    direction,
                    // If setting to At Least, default to Best.
                    value === undefined ? crate.IVJudgment.Best : value[1],
                ])
                return
            } else {
                return unreachable()
            }
        },
        [onChange, value],
    )

    const handleJudgmentChange: React.ChangeEventHandler<HTMLSelectElement> = React.useCallback(
        e => {
            const updatedValue = parseInt(e.currentTarget.value, 10)
            // If judgment is reset, disable the filter.
            if (isNaN(updatedValue)) {
                onChange(undefined)
                return
            }
            // If user chooses "No Good", set the range direction to "At Most".
            const updatedDirection =
                updatedValue === crate.IVJudgment.NoGood
                    ? crate.RangeDirection.AtMost
                    : value
                    ? value[0]
                    : crate.RangeDirection.AtLeast

            onChange([updatedDirection, updatedValue])
        },
        [value, onChange],
    )

    return (
        <label className={css(styles.singleIVFilter)}>
            <div className={css(styles.ivLabel)}>{name}</div>
            <div className={css(styles.ivFilterOptions)}>
                <Switcher<RangeDirection | AnyOption>
                    className={css(styles.rangeDirectionSwitcher)}
                    title={<ScreenReaderText>Direction</ScreenReaderText>}
                    groupName={`filter-iv-range-direction-${name}`}
                    allowDeselect={false}
                    value={value ? value[0] : ANY}
                    items={[
                        {
                            item: ANY,
                            disabled: false,
                        },
                        {
                            item: crate.RangeDirection.AtLeast,
                            disabled: false,
                        },
                        {
                            item: crate.RangeDirection.AtMost,
                            disabled: false,
                        },
                    ]}
                    onChange={handleRangeDirectionChange}
                    renderItemTitle={renderItemTitle}
                    getItemAriaLabel={getAriaItemLabel}
                />
                <select
                    name="iv-judgment"
                    value={value ? value[1] : "-"}
                    onChange={handleJudgmentChange}
                >
                    {[
                        "-" as const,
                        crate.IVJudgment.Best,
                        crate.IVJudgment.Fantastic,
                        crate.IVJudgment.VeryGood,
                        crate.IVJudgment.PrettyGood,
                        crate.IVJudgment.Decent,
                        crate.IVJudgment.NoGood,
                    ].map((judgment, index) => (
                        <option key={index} value={judgment}>
                            {formatJudgment(judgment)}
                        </option>
                    ))}
                </select>
            </div>
        </label>
    )
}

type IVFilterProps = {
    value: Filters["iv"]
    onChange: (value: Filters["iv"]) => void
}

export function IVFilter({ value, onChange }: IVFilterProps): JSX.Element {
    return (
        <fieldset className={css(styles.fieldset)}>
            <legend>IVs</legend>
            {[
                "HP",
                "Attack",
                "Defense",
                "Special Attack",
                "Special Defense",
                "Speed",
            ].map((name, index) => (
                <SingleIVFilter
                    key={index}
                    name={name}
                    value={value && value[index]}
                    onChange={result => {
                        onChange([
                            index === 0 ? result : value[0],
                            index === 1 ? result : value[1],
                            index === 2 ? result : value[2],
                            index === 3 ? result : value[3],
                            index === 4 ? result : value[4],
                            index === 5 ? result : value[5],
                        ])
                    }}
                />
            ))}
        </fieldset>
    )
}

const styles = StyleSheet.create({
    fieldset: {
        flexBasis: "100%",

        "@media (min-width: 400px)": {
            flexBasis: "auto",
        },
    },
    singleIVFilter: {
        display: "flex",
        flexDirection: "column",
        fontSize: 14,
        lineHeight: 1.2,
        marginBottom: 6,

        "@media (min-width: 600px)": {
            display: "grid",
            gridTemplateColumns: "0.5fr 1.5fr",
            alignItems: "center",
        },
    },
    ivLabel: {
        marginTop: 8,
        marginBottom: 8,

        "@media (min-width: 600px)": {
            marginRight: 12,
        },
    },
    ivFilterOptions: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        "@media (min-width: 400px)": {
            flexDirection: "row",
        },

        "@media (min-width: 600px)": {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
        },
    },
    rangeDirectionSwitcher: {
        padding: 0,
        marginBottom: 8,

        "@media (min-width: 600px)": {
            marginBottom: 0,
        },
    },
})
