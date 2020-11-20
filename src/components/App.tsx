import * as React from "react"
import { StyleSheet, css } from "aphrodite/no-important"
import crate from "../../crate/Cargo.toml"

import * as den from "../helpers/den"
import * as filter from "../helpers/filter"
import * as frame from "../helpers/frame"
import * as settings from "../helpers/settings"
import { Button } from "./Button"
import { DenPreview } from "./DenPreview"
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

const submitErrorReason = {
    invalidIVFilters: {
        type: "invalid_iv_filters" as const,
        message: "Too many imperfect IV filters.",
    },
    noEncounterSelected: {
        type: "no_encounter_selected" as const,
        message: "Please select a mon.",
    },
}

export function App(): JSX.Element {
    /**
     * State and lifecycle.
     */
    const [state, setState] = React.useState<State>(createDefaultState())
    const [seed, setSeed] = React.useState<BigInt | undefined>(
        BigInt("0xbb810e6006a2a035"),
    )
    const [result, setResult] = React.useState<
        frame.FrameResult | null | undefined
    >()

    const currentEncounter = React.useMemo(
        () => den.getCurrentRaidEntry(state.raid, state.settings),
        [state.raid, state.settings],
    )
    const genderPool = React.useMemo(
        () => den.getGenderPoolForEncounter(currentEncounter),
        [currentEncounter],
    )

    // List of possible mon encounters for the current den.
    const encounters = React.useMemo(
        () => den.getEntriesForSettings(state.settings)(state.raid.den) || [],
        [state.raid.den, state.settings],
    )

    // Disable submission if filters are invalid for the chosen raid.
    const submitError = React.useMemo(() => {
        if (!currentEncounter) {
            return submitErrorReason.noEncounterSelected
        }

        // Check IVs filtered to be imperfect.
        // e.g. if the raid has 4 guaranteed IVs, the user can constrain
        // at most 2 IVs to be less than perfect.
        const maxImperfectIVs =
            state.filters.iv.length - currentEncounter.minFlawlessIVs
        const numFilteredImperfectIVs = state.filters.iv.filter(
            iv =>
                iv &&
                iv.direction === crate.RangeDirection.AtMost &&
                iv.judgment !== crate.IVJudgment.Best,
        ).length

        if (numFilteredImperfectIVs > maxImperfectIVs) {
            return submitErrorReason.invalidIVFilters
        }
    }, [currentEncounter, state.filters.iv])

    /**
     * Helpers.
     */
    const updateSettings = React.useCallback(
        (update: Partial<settings.Settings>) => {
            const current = state.settings

            // Changing the game title or badge level affects the tables for each den,
            // which can affect the gender/ability pool, so we reset these filters
            const shouldResetGenderOrAbilityFilter =
                (update.gameTitle && update.gameTitle !== current.gameTitle) ||
                (update.badgeLevel && update.badgeLevel !== current.badgeLevel)

            const nextState = {
                ...state,
                settings: { ...state.settings, ...update },
                raid: { ...state.raid, entryIndex: 0 },
                ...(shouldResetGenderOrAbilityFilter && {
                    filters: {
                        ...state.filters,
                        gender: undefined,
                        ability: undefined,
                    },
                }),
            }

            setState(nextState)
            settings.saveSettings(nextState.settings)
            filter.saveFilters(nextState.filters)
        },
        [state],
    )

    const updateRaid = React.useCallback(
        (update: Partial<RaidData>) => {
            const nextState = {
                ...state,
                raid: { ...state.raid, ...update },
                // Since the new mon may have different gender lock, reset the gender filter.
                filters: {
                    ...state.filters,
                    gender: undefined,
                    ability: undefined,
                },
            }
            setState(nextState)
            filter.saveFilters(nextState.filters)
            den.saveRaid(nextState.raid)
        },
        [state],
    )

    const updateFilters = React.useCallback(
        (update: Partial<Filters>) => {
            const nextState = {
                ...state,
                filters: { ...state.filters, ...update },
            }
            setState(nextState)
            filter.saveFilters(nextState.filters)
        },
        [state],
    )

    const handleDenPreviewChange = (index: number) => {
        updateRaid({ entryIndex: index })
    }

    function handleSearch() {
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
            setResult(null)
            return
        }
        setResult(frame.createFrame(result[0], result[1]))
    }

    /**
     * Render.
     */
    return (
        <div className={css(styles.appWrapper)}>
            <header className={css(styles.header)}>
                <SettingsForm
                    value={state.settings}
                    updateValue={updateSettings}
                />
                <RaidForm
                    value={state.raid}
                    encounters={encounters}
                    updateValue={updateRaid}
                />
            </header>
            <DenPreview
                value={state.raid.entryIndex}
                encounters={encounters}
                onChange={handleDenPreviewChange}
            />
            <FilterForm
                value={state.filters}
                updateValue={updateFilters}
                currentEncounter={currentEncounter}
                currentGenderPool={genderPool}
            />
            <div className={css(styles.seedSubmit)}>
                <Seed value={seed} updateValue={setSeed} />
                <Button
                    type="submit"
                    onClick={handleSearch}
                    disabled={!!submitError}
                >
                    Search
                </Button>
                <span className={css(styles.submitError)}>
                    {submitError && submitError.message}
                </span>
            </div>
            <Results result={result} currentEncounter={currentEncounter} />
            <Footer />
        </div>
    )
}

const styles = StyleSheet.create({
    appWrapper: {
        overflow: "hidden",
        width: "90%",
        maxWidth: 720,
        margin: "0 auto",
        padding: "12px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    header: {
        width: "100%",

        "@media (min-width: 600px)": {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        },
    },
    seedSubmit: {
        marginTop: 16,
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
    },
    submitError: {
        color: "var(--red)",
    },
})
