import * as React from "react"

import * as frame from "../helpers/frame"

import type { WorkerRequest, WorkerResponse } from "../worker/message"

type WorkerArgs = {
    setResult: React.Dispatch<
        React.SetStateAction<Result<frame.FrameResult, undefined> | undefined>
    >
}

interface WorkerInterface {
    postMessage(request: WorkerRequest): void
    isWorking: boolean
}

export const useWorker = ({ setResult }: WorkerArgs): WorkerInterface => {
    const [isWorking, setIsWorking] = React.useState<boolean>(false)

    const worker = React.useMemo(() => {
        const worker = new Worker("../worker/main.ts")

        worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
            const { data: response } = e
            if (response.type === "SEARCH_RESPONSE") {
                const { result } = response.data
                setResult(result)
                setIsWorking(false)
                return
            }
        }

        return worker
    }, [setResult])

    const postMessage = React.useCallback(
        (request: WorkerRequest) => {
            worker.postMessage(request)
            setIsWorking(true)
        },
        [worker],
    )

    return {
        postMessage,
        isWorking,
    }
}
