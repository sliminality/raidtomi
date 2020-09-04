import * as React from "react"
import {
    createDefaultState,
    createDefaultRaid,
    createDefaultSettings,
    createDefaultFilters,
} from "../state"
import * as state from "../state"
import * as den from "../helpers/den"
import { Settings } from "./Settings"
import { Raid } from "./Raid"
import { Filters } from "./Filters"
import { Seed } from "./Seed"

import type { State } from "../state"

type DispatchState = React.Dispatch<React.SetStateAction<State>>

export function App() {
    // State.
    const [state, setState] = React.useState<State>(createDefaultState())
    const [seed, setSeed] = React.useState<BigInt | undefined>()
    const dispatch = { setState, setSeed }

    // Handlers.
    const updateSettings = (update: Partial<state.Settings>) => {
        const current = state.settings

        // Changing the game title affects the tables for each den.
        // This may affect the available filters.
        if (update.gameTitle && update.gameTitle !== current.gameTitle) {
        }

        // Changing the badge level affects the tables for each den.
        if (update.gameTitle && update.gameTitle !== current.gameTitle) {
        }

        setState({ ...state, settings: { ...state.settings, ...update } })
    }
    const updateRaid = (update: Partial<state.Raid>) => {
        // Changing the den affects the mon entries.
        // Changing the mon affects filter legality.
        setState({
            ...state,
            raid: { ...state.raid, ...update },
        })
    }
    const updateFilters = (update: Partial<state.Filters>) => {}

    const mon = den.getRaidMon(state.raid, state.settings)

    return (
        <React.Fragment>
            <Settings value={state.settings} updateValue={updateSettings} />
            <details open={true}>
                <summary>Raid</summary>
                <Raid
                    value={state.raid}
                    settings={state.settings}
                    updateValue={updateRaid}
                />
            </details>
            <Filters
                value={state.filters}
                mon={mon}
                updateValue={updateFilters}
            />
            <Seed value={seed} updateValue={setSeed} />
            <button type="submit">Search</button>
        </React.Fragment>
    )
}
