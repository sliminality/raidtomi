import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"

export function Button(
    props: React.ButtonHTMLAttributes<HTMLButtonElement>,
): JSX.Element {
    return <button className={css(styles.button, props.disabled && styles.buttonDisabled)} {...props} />
}

const styles = StyleSheet.create({
    button: {
        background: "var(--blue)",
        color: "white",
        border: "none",
        borderRadius: 4,
        boxShadow: "var(--button-outline)",
        padding: "6px 12px",
        marginRight: 8,
        marginBottom: 4,
    },
    buttonDisabled: {
        background: "var(--button-disabled)",
        boxShadow: "var(--button-disabled-outline)",
        cursor: "not-allowed"
    }
})
