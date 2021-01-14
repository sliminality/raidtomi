import * as React from "react"

import * as frame from "../helpers/frame"

import type { WorkerResponse } from "../worker/message"

type WorkerArgs = {
    setResult: React.Dispatch<
        React.SetStateAction<Result<frame.FrameResult, undefined> | undefined>
    >
}

export const useWorker = ({ setResult }: WorkerArgs): Worker =>
    React.useMemo(() => {
        const worker = new Worker("../worker/main.ts")

        worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
            const { data: response } = e
            if (response.type === "SEARCH_RESPONSE") {
                const { result } = response.data
                setResult(result)
                return
            }
        }
        return worker
    }, [setResult])
