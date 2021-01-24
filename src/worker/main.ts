/**
 * Main Web Worker thread.
 */

import crate from "../../crate/Cargo.toml"

import * as den from "../helpers/den"
import * as filter from "../helpers/filter"
import * as frame from "../helpers/frame"

import type { DenEncounter } from "../helpers/den"
import type { Filters } from "../helpers/filter"
import type { WorkerRequest, WorkerResponse } from "./message"

/**
 * A typed wrapper for `postMessage`.
 */
function postMessageToMain(message: WorkerResponse): void {
    globalThis.postMessage(message)
}

globalThis.onmessage = (e: MessageEvent<WorkerRequest>) => {
    const { data: request } = e
    switch (request.type) {
        case "SEARCH_REQUEST": {
            handleSearch(request.data)
        }
    }
}

function handleSearch(args: {
    currentEncounter: DenEncounter
    seed: BigInt
    filters: Filters
}): void {
    const { currentEncounter, seed, filters } = args
    const raid = den.createRaid(currentEncounter)
    const result = crate.search(raid, seed, filter.createFilter(filters))

    const data = result
        ? {
              type: "ok" as const,
              value: frame.createFrame(result[0], result[1]),
          }
        : {
              type: "err" as const,
              error: undefined,
          }

    postMessageToMain({
        type: "SEARCH_RESPONSE",
        data: { result: data },
    })
}
