import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"
import crate from "../../crate/Cargo.toml"

import * as den from "../helpers/den"
import * as filter from "../helpers/filter"
import * as frame from "../helpers/frame"
import * as settings from "../helpers/settings"
import { Button } from "./Button"
import { FilterForm } from "./FilterForm"
import { Footer } from "./Footer"
import { Results } from "./Results"
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
    /**
     * State and lifecycle.
     */
    const [state, setState] = React.useState<State>(createDefaultState())
    const [seed, setSeed] = React.useState<BigInt | undefined>()
    const [result, setResult] = React.useState<frame.FrameResult | undefined>()

    const currentEncounter = React.useMemo(
        () => den.getCurrentRaidEntry(state.raid, state.settings),
        [state.raid, state.settings],
    )
    const genderPool = React.useMemo(
        () => den.getGenderPoolForEncounter(currentEncounter),
        [currentEncounter],
    )

    /**
     * Helpers.
     */
    const updateSettings = (update: Partial<settings.Settings>) => {
        const current = state.settings

        // Changing the game title or badge level affects the tables for each den,
        // which can affect the gender/ability pool, so we reset these filters
        const shouldResetGenderOrAbilityFilter =
            (update.gameTitle && update.gameTitle !== current.gameTitle) ||
            (update.badgeLevel && update.badgeLevel !== current.badgeLevel)

        const nextState = {
            ...state,
            settings: { ...state.settings, ...update },
            ...(shouldResetGenderOrAbilityFilter && {
                filters: {
                    ...state.filters,
                    gender: undefined,
                    ability: undefined,
                },
            }),
        }

        setState(nextState)
    }

    const updateRaid = React.useCallback((update: Partial<RaidData>) => {
        setState(state => ({
            ...state,
            raid: { ...state.raid, ...update },
            // Since the new mon may have different gender lock, reset the gender filter.
            filters: {
                ...state.filters,
                gender: undefined,
                ability: undefined,
            },
        }))
    }, [])

    const updateFilters = React.useCallback((update: Partial<Filters>) => {
        setState(state => ({
            ...state,
            filters: { ...state.filters, ...update },
        }))
    }, [])

    const handleSearch = React.useCallback(() => {
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
            filter.createFilter(state.filters),
        )
        if (!result) {
            return
        }
        setResult(frame.createFrame(result[0], result[1]))
    }, [currentEncounter, seed, state.filters])

    /**
     * Render.
     */
    return (
        <div className={css(styles.appWrapper)}>
            <SettingsForm value={state.settings} updateValue={updateSettings} />
            <RaidForm
                value={state.raid}
                settings={state.settings}
                updateValue={updateRaid}
            />
            <FilterForm
                value={state.filters}
                updateValue={updateFilters}
                currentEncounter={currentEncounter}
                currentGenderPool={genderPool}
            />
            <div className={css(styles.seedSubmit)}>
                <Seed value={seed} updateValue={setSeed} />
                <Button type="submit" onClick={handleSearch}>
                    Search
                </Button>
            </div>
            <Results result={result} currentEncounter={currentEncounter} />
            <Footer />
        </div>
    )
}

const styles = StyleSheet.create({
    appWrapper: {
        padding: 12,
    },
    seedSubmit: {
        marginTop: 12,
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
    },
})
