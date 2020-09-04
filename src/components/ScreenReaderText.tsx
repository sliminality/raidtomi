/**
 * Text only visible to screen readers.
 */
import * as React from "react"

type ScreenReaderTextProps = {
    children: React.ReactNode
}

export function ScreenReaderText({
    children,
}: ScreenReaderTextProps): JSX.Element {
    return (
        <span
            style={{
                clip: "rect(0 0 0 0)",
                overflow: "hidden",
                position: "absolute",
                height: 1,
                width: 1,
            }}
        >
            {children}
        </span>
    )
}
