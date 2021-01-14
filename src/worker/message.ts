/**
 * Defines the types of messages sent to and from the worker.
 */
import type { DenEncounter } from "../helpers/den"
import type { Filters } from "../helpers/filter"
import type { FrameResult } from "../helpers/frame"

// Generic type of a message passed between threads.
interface MessageShape {
    type: string
    data: Record<string, unknown>
}

export type WorkerRequest = {
    type: "SEARCH_REQUEST"
    data: {
        currentEncounter: DenEncounter
        seed: BigInt
        filters: Filters
    }
}

type ResponseMap = Assert<
    {
        SEARCH_REQUEST: {
            type: "SEARCH_RESPONSE"
            data: {
                result: Result<FrameResult, undefined>
            }
        }
    },
    // Assert that all requests have a response.
    { [T in WorkerRequest["type"]]: MessageShape }
>

// Assert all responses correspond to some request, i.e. there are no extra responses.
type AssertSound = Assert<keyof ResponseMap, WorkerRequest["type"]>

export type WorkerResponse = Values<ResponseMap>
