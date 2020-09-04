import * as React from "react"
import crate from "../../crate/Cargo.toml"

import * as den from "../helpers/den"
import * as filter from "../helpers/filter"
import * as frame from "../helpers/frame"
import * as settings from "../helpers/settings"
import { FilterForm } from "./FilterForm"
import { RaidForm } from "./RaidForm"
import { Seed } from "./Seed"
import { SettingsForm } from "./SettingsForm"

import type { Filters } from "../helpers/filter"
import type { RaidData } from "../helpers/den"
import type { Settings } from "../helpers/settings"

export type State = {
    raid: RaidData
    filters: Filters
    settings: Settings
}

export function createDefaultState(): State {
    return {
        raid: den.createDefaultRaid(),
        filters: filter.createDefaultFilters(),
        settings: settings.createDefaultSettings(),
    }
}

export function App(): JSX.Element {
    // State.
    const [state, setState] = React.useState<State>(createDefaultState())
    const [seed, setSeed] = React.useState<BigInt | undefined>()

    // Handlers.
    const updateSettings = (update: Partial<settings.Settings>) => {
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
    const updateRaid = (update: Partial<RaidData>) => {
        // Changing the den affects the mon entries.
        // Changing the mon affects filter legality.
        setState({
            ...state,
            raid: { ...state.raid, ...update },
        })
    }
    const updateFilters = (update: Partial<Filters>) => {}

    const currentEncounter = React.useMemo(
        () => den.getCurrentRaidEntry(state.raid, state.settings),
        [state.raid, state.settings]
    )

    const handleSearch = () => {
        if (!currentEncounter) {
            return
        }
        if (!seed) {
            return
        }
        const raid = den.createRaid(currentEncounter)
        const result = crate.search(
            raid,
            seed,
            filter.createFilter(state.filters)
        )
        if (!result) {
            return
        }
        console.log(result[0], frame.formatSeed(result[1].get_seed()))
    }

    return (
        <React.Fragment>
            <SettingsForm value={state.settings} updateValue={updateSettings} />
            <details open={true}>
                <summary>Raid</summary>
                <RaidForm
                    value={state.raid}
                    settings={state.settings}
                    updateValue={updateRaid}
                />
            </details>
            <FilterForm
                value={state.filters}
                currentEncounter={currentEncounter}
                updateValue={updateFilters}
            />
            <Seed value={seed} updateValue={setSeed} />
            <button type="submit" onClick={handleSearch}>
                Search
            </button>
        </React.Fragment>
    )
}
