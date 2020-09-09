/**
 * Frame seed input.
 */
import * as React from "react"

type SeedProps = {
    value: BigInt | undefined
    updateValue: React.Dispatch<React.SetStateAction<BigInt | undefined>>
}

export function Seed({ value, updateValue }: SeedProps): JSX.Element {
    const valueAsHex = React.useMemo(() => (value ? value.toString(16) : ""), [
        value,
    ])
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
            bigInt = BigInt(`0x${text}`)
        } catch (error) {
            setInvalidState({ temporaryValue: text, message: "Invalid seed" })
            return
        }
        if (bigInt > BigInt("0xFFFFFFFFFFFFFFFF")) {
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
                    placeholder="bb810e6006a2a035"
                    pattern="[0-9a-fA-F]{16}"
                    size={16}
                />
                {invalidState && invalidState.message}
            </label>
        </div>
    )
}
