/**
 * Search results.
 */
import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"
import crate from "../../crate/Cargo.toml"
import * as ability from "../helpers/ability"
import * as den from "../helpers/den"
import * as frame from "../helpers/frame"

type ResultsProps = {
    result: frame.FrameResult | null | undefined
    currentEncounter: den.DenEncounter | undefined
}

type ResultRowProps = {
    result: frame.FrameResult | undefined
    currentEncounter: den.DenEncounter | undefined
}

export function Results({
    result,
    currentEncounter,
}: ResultsProps): JSX.Element {
    if (result === null) {
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
                    {result && renderRow({ result, currentEncounter })}
                </tbody>
            </table>
        </section>
    )
}

function renderRow({ result, currentEncounter }: ResultRowProps) {
    // TODO: This is incoherent, model state as discriminated union.
    if (!result || !currentEncounter) {
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
