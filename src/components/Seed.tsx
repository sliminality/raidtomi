/**
 * Frame seed input.
 */
import * as React from "react"

type SeedProps = {
    value: BigInt | undefined
    updateValue: React.Dispatch<React.SetStateAction<BigInt | undefined>>
}

export function Seed(props: SeedProps) {
    return <div>seed</div>
}
