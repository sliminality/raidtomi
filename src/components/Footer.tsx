import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"

export function Footer(): JSX.Element {
    return (
        <footer className={css(styles.footer)}>
            Thanks to{" "}
            <a
                href="https://github.com/Admiral-Fish/"
                target="_blank"
                rel="noopener noreferrer"
            >
                AdmiralFish
            </a>
            ,{" "}
            <a
                href="https://github.com/leanny"
                target="_blank"
                rel="noopener noreferrer"
            >
                Leanny
            </a>
            ,{" "}
            <a
                href="https://github.com/zaksabeast"
                target="_blank"
                rel="noopener noreferrer"
            >
                zaksabeast
            </a>
            , and{" "}
            <a
                href="https://github.com/ShinySylveon04"
                target="_blank"
                rel="noopener noreferrer"
            >
                Shiny_Sylveon
            </a>
            .
        </footer>
    )
}

const styles = StyleSheet.create({
    footer: {
        marginTop: 48,
        color: "var(--light-text-color)",
        justifySelf: "end",
        lineHeight: 1.4,
    },
})
