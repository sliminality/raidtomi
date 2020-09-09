/**
 * A generic component for creating a button group to switch between options.
 */
import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"

export type SwitcherItem<T extends { toString: () => string }> = {
    item: T
    disabled?: boolean
}

export type SwitcherProps<T extends { toString: () => string }> =
    | {
          groupName: string
          items: Array<SwitcherItem<T>>
          value: T | undefined
          onChange: (value: T | undefined) => void
          renderItemTitle: (item: T) => React.ReactNode
          getItemAriaLabel: (item: T) => string
          allowDeselect: true
      }
    | {
          groupName: string
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
    const { items, value, renderItemTitle, getItemAriaLabel, groupName } = prop$
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

    const renderItem = ({ item, disabled }: SwitcherItem<T>, index: number) => {
        const id = `switcher-${groupName}-${item.toString()}`
        return (
            <div key={index} className={css(styles.itemWrapper)}>
                <input
                    id={id}
                    type="radio"
                    name={groupName}
                    value={item.toString()}
                    checked={item === value}
                    onChange={handleClick(item)}
                    disabled={disabled}
                    aria-label={getItemAriaLabel(item)}
                    className={css(styles.radioButton)}
                />
                <label htmlFor={id} className={css(styles.itemLabel)}>
                    {renderItemTitle(item)}
                </label>
            </div>
        )
    }

    return (
        <fieldset className={css(styles.fieldset)}>
            <legend>hiyia</legend>
            {items.map(renderItem)}
        </fieldset>
    )
}

const styles = StyleSheet.create({
    fieldset: {},
    itemWrapper: {
        display: "inline-flex",
        lineHeight: 1.4,

        ":first-of-type > label": {
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
        },
        ":last-of-type > label": {
            borderRight: "1px solid black",
            borderTopRightRadius: 4,
            borderBottomRightRadius: 4,
        },
    },
    radioButton: {
        clip: "rect(0 0 0 0)",
        overflow: "hidden",
        position: "absolute",
        height: 1,
        width: 1,

        ":focus + label": {
            boxShadow: "var(--focus-ring)",
        },
        ":disabled + label": {
            color: "grey",
            borderColor: "grey",
        },
        ":checked + label": {
            color: "blue",
            borderColor: "blue",
        },
    },
    itemLabel: {
        padding: 8,
        display: "inline-flex",
        cursor: "pointer",
        borderTop: "1px solid black",
        borderBottom: "1px solid black",
        borderLeft: "1px solid black",
    },
    itemPressed: {
        background: "rgba(0, 0, 255, 0.5)",
    },
})
