/**
 * Frame seed input.
 */
import * as React from "react"

import * as seedHelpers from "../helpers/seed"

type SeedProps = {
    value: BigInt | undefined
    updateValue: (update: BigInt | undefined) => void
}

export function Seed({ value, updateValue }: SeedProps): JSX.Element {
    const valueAsHex = React.useMemo(
        () => (value ? seedHelpers.convert.bigInt.toString(value) : ""),
        [value],
    )
    const [invalidState, setInvalidState] = React.useState<
        | {
              temporaryValue: string
              message?: string
          }
        | undefined
    >()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.currentTarget.value
        if (text === "") {
            updateValue(undefined)
            return
        }

        let bigInt
        try {
            bigInt = seedHelpers.convert.string.toBigInt(text)
        } catch (error) {
            setInvalidState({ temporaryValue: text, message: "Invalid seed" })
            return
        }
        if (bigInt > seedHelpers.MAX_VALID_SEED) {
            setInvalidState({ temporaryValue: text, message: "Invalid seed" })
            return
        }

        updateValue(bigInt)
        setInvalidState(undefined)
    }

    const handleBlur = () => {
        setInvalidState(undefined)
    }

    return (
        <div>
            <label>
                Seed
                <input
                    type="text"
                    value={
                        invalidState ? invalidState.temporaryValue : valueAsHex
                    }
                    onChange={handleChange}
                    onBlur={handleBlur}
                    pattern="[0-9a-fA-F]{16}"
                    size={16}
                />
                {invalidState && invalidState.message}
            </label>
        </div>
    )
}
