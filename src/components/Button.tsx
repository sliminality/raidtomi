import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button className={css(styles.button)} {...props} />
}

const styles = StyleSheet.create({
    button: {
        background: "var(--blue)",
        color: "white",
        border: "none",
        borderRadius: 4,
        boxShadow: "var(--button-outline)",
        padding: "6px 12px",
    },
})
