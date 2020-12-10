/**
 * List of frames matching the query.
 */
import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"
import crate from "../../crate/Cargo.toml"
import * as ability from "../helpers/ability"
import * as den from "../helpers/den"
import * as frame from "../helpers/frame"

type FrameListProps = {
    result: Result<frame.FrameResult, undefined> | undefined
    currentEncounter: den.DenEncounter | undefined
    updateSeed: (update: BigInt | undefined) => void
}

type FrameListItemProps = {
    result: frame.FrameResult
    currentEncounter: den.DenEncounter | undefined
    updateSeed: (update: BigInt | undefined) => void
}

export function FrameList({
    result,
    currentEncounter,
    updateSeed,
}: FrameListProps): JSX.Element {
    if (result && result.type === "err") {
        return <span>No result found within 10 million frames.</span>
    }
    return (
        <section className={css(styles.wrapper)}>
            <table className={css(styles.table)}>
                <thead>
                    <tr>
                        <th>Skips</th>
                        <th>Shiny</th>
                        <th>IVs</th>
                        <th>Ability</th>
                        <th>Gender</th>
                        <th>Nature</th>
                        <th>Seed</th>
                    </tr>
                </thead>
                <tbody>
                    {result &&
                        renderRow({
                            result: result.value,
                            currentEncounter,
                            updateSeed,
                        })}
                </tbody>
            </table>
        </section>
    )
}

function renderRow({ result, currentEncounter }: FrameListItemProps) {
    // TODO: This is incoherent, model state as discriminated union.
    if (!currentEncounter) {
        return
    }

    const abilities = ability.getAbilitiesForEntry(currentEncounter)
    const shinyCaption =
        result.shiny === crate.Shininess.Square
            ? "Square"
            : result.shiny === crate.Shininess.Star
            ? "Star"
            : "Not shiny"

    return (
        <tr>
            <Cell>{result.skips.toString(10)}</Cell>
            <Cell title={shinyCaption}>{frame.formatShiny(result.shiny)}</Cell>
            <Cell>{result.ivs.map(n => n.toString(10)).join("/")}</Cell>
            <Cell>
                {abilities
                    ? `${abilities[result.ability]} (${frame.formatAbility(
                          result.ability,
                          true,
                      )})`
                    : frame.formatAbility(result.ability)}
            </Cell>
            <Cell>{frame.formatGender(result.gender)}</Cell>
            <Cell>{frame.formatNature(result.nature)}</Cell>
            <Cell>
                <code>{result.seed}</code>
            </Cell>
        </tr>
    )
}

type CellProps = {
    children: React.ReactNode
    title?: string
}

function Cell({ children, title }: CellProps) {
    return <td title={title}>{children}</td>
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        overflow: "auto",
        marginTop: 12,
    },
    table: {
        textAlign: "left",
        borderSpacing: 8,
    },
})
