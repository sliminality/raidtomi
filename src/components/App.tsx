import * as React from "react"
import {
    createDefaultRaid,
    createDefaultSettings,
    createDefaultFilters,
} from "../state"
import * as state from "../state"
import { Settings } from "./Settings"
import { Raid } from "./Raid"
import { Filters } from "./Filters"
import { Seed } from "./Seed"

export function App() {
    // State.
    const [settings, setSettings] = React.useState<state.Settings>(
        createDefaultSettings()
    )
    const [raid, setRaid] = React.useState<state.Raid>(createDefaultRaid())
    const [filters, setFilters] = React.useState<state.Filters>(
        createDefaultFilters()
    )
    const [seed, setSeed] = React.useState<BigInt | undefined>()

    // Handlers.
    const handleChangeSettings = () => {
        // Changing the game title affects the tables for each den.
        // Changing the badge level affects the tables for each den.
    }
    const handleChangeRaid = () => {
        // Changing the den affects the mon entries.
        // Changing the mon affects filter legality.
    }

    const mon = getRaidMon(raid)

    return (
        <React.Fragment>
            <Settings value={settings} updateValue={setSettings} />
            <Raid value={raid} settings={settings} updateValue={setRaid} />
            <Filters value={filters} mon={mon} updateValue={setFilters} />
            <Seed value={seed} updateValue={setSeed} />
            <button type="submit">Search</button>
        </React.Fragment>
    )
}

function getRaidMon(raid: state.Raid): { species: number; form: number } {
    return { species: 1, form: 0 }
}
