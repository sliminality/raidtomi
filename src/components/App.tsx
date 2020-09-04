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

        // Changing the game title or badge level affects the tables for each den,
        // which can affect the gender pool, so we reset the gender filter.
        const shouldResetGenderFilter =
            (update.gameTitle && update.gameTitle !== current.gameTitle) ||
            (update.badgeLevel && update.badgeLevel !== current.badgeLevel)

        const nextState = {
            ...state,
            settings: { ...state.settings, ...update },
            ...(shouldResetGenderFilter && {
                filters: { ...state.filters, gender: undefined },
            }),
        }

        setState(nextState)
    }
    const updateRaid = (update: Partial<RaidData>) => {
        setState({
            ...state,
            raid: { ...state.raid, ...update },
            // Since the new mon may have different gender lock, reset the gender filter.
            filters: { ...state.filters, gender: undefined },
        })
    }
    const updateFilters = (update: Partial<Filters>) => {
        setState({ ...state, filters: { ...state.filters, ...update } })
    }

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
            <details open={false}>
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
