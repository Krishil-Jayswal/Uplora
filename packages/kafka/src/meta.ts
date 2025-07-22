export const CLIENT_ID = "deploy-sphere";

export const MECHANISM = "scram-sha-256";

export enum Topic {
  JOB = "job",
  STORE_LOGS = "store-logs",
}

export enum GroupId {
  PROCESSOR = "processor",
  PUSHER = "pusher",
}
