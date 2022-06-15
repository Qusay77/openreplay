export interface Options {
  connAttemptCount?: number
  connAttemptGap?:   number
  workerLog?:         WorkerActivityLogStatus
}

type Start = {
  type:             "start",
  ingestPoint:      string
  pageNo:           number
  timestamp:        number
} & Options

type Auth = {
  type:             "auth"
  token:            string
  beaconSizeLimit?:  number
}

export enum WorkerActivityLogStatus {
  Off,
  Console,
  Error,
  ErrorWithData,
}


export type WorkerMessageData = null | "stop" | Start | Auth | Array<{ _id: number }> | Log
