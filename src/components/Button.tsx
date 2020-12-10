import * as React from "react"
import { StyleSheet, css, StyleDeclarationValue } from "aphrodite/no-important"

type ButtonProps = Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "style"
> & {
    style: "primary" | "link"
}

export function Button({ style, ...props }: ButtonProps): JSX.Element {
    const buttonStyles: StyleDeclarationValue = React.useMemo(() => {
        switch (style) {
            case "primary":
                return styles.buttonPrimary
            case "link":
                return styles.buttonLink
            default:
                return unreachable()
        }
    }, [style])

    return <button className={css(buttonStyles)} {...props} />
}

const styles = StyleSheet.create({
    buttonPrimary: {
        background: "var(--blue)",
        color: "white",
        border: "none",
        borderRadius: 4,
        boxShadow: "var(--button-outline)",
        padding: "6px 12px",
        marginRight: 8,
        marginBottom: 4,

        ":disabled": {
            background: "var(--button-disabled)",
            boxShadow: "var(--button-disabled-outline)",
            cursor: "not-allowed",
        },
    },
    buttonLink: {
        background: "transparent",
        cursor: "pointer",
        border: "none",
        color: "var(--blue)",

        ":hover": {
            color: "var(--dark-blue)",
        },

        ":disabled": {
            color: "var(--light-text-color)",
            cursor: "not-allowed",
        },
    },
})
