/**
 * A generic component for creating a button group to switch between options.
 */
import * as React from "react"

export type SwitcherItem<T extends { toString: () => string }> = {
    item: T
    disabled?: boolean
}

export type SwitcherProps<T extends { toString: () => string }> =
    | {
          items: Array<SwitcherItem<T>>
          value: T | undefined
          onChange: (value: T | undefined) => void
          renderItemTitle: (item: T) => React.ReactNode
          getItemAriaLabel: (item: T) => string
          allowDeselect: true
      }
    | {
          items: Array<SwitcherItem<T>>
          value: T
          onChange: (value: T) => void
          renderItemTitle: (item: T) => React.ReactNode
          getItemAriaLabel: (item: T) => string
          allowDeselect?: false
      }

export function Switcher<T extends { toString: () => string }>(
    // There's a crazy eslint bug where using the identifier `props` causes
    // props validation to fail, so in the meantime use `propz`.
    // https://github.com/yannickcr/eslint-plugin-react/issues/2654
    prop$: SwitcherProps<T>
): JSX.Element {
    const { items, value, renderItemTitle, getItemAriaLabel } = prop$
    // const [hovered, setHovered] = React.useState<string | undefined>(
    //     initialValueId
    // )
    const handleClick = (item: T) => () => {
        // If item is currently selected, check if deselection is allowed and
        // reset the current selection if so.
        if (item === value && prop$.allowDeselect) {
            prop$.onChange(undefined)
        } else {
            prop$.onChange(item)
        }
    }

    const renderItem = ({ item, disabled }: SwitcherItem<T>, index: number) => (
        <label key={index}>
            <input
                type="radio"
                name={groupName}
                value={item.toString()}
                checked={item === value}
                onChange={handleClick(item)}
                disabled={disabled}
                aria-label={getItemAriaLabel(item)}
            />
            {renderItemTitle(item)}
        </label>
    )

    return (
        <fieldset>
            <legend>hi</legend>
            {items.map(renderItem)}
        </fieldset>
    )
}

const styles = {
    list: {
        listStyleType: "none",
        margin: 0,
        padding: 0,
        display: "flex",
    },
    item: {},
    itemPressed: {
        background: "rgba(0, 0, 255, 0.5)",
    },
}
