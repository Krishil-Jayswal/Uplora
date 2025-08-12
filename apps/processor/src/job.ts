import { BatchV1ApiCreateNamespacedJobRequest } from "@kubernetes/client-node";
import { Job } from "@repo/validation";

export const createJobRequest = (Job: Job) => {
  const JOB_JSON_BASE64 = Buffer.from(JSON.stringify(Job), "utf8").toString(
    "base64",
  );
  const batchV1ApiCreateNamespacedJobRequest: BatchV1ApiCreateNamespacedJobRequest =
    {
      namespace: "deploysphere",
      body: {
        kind: "Job",
        apiVersion: "batch/v1",
        metadata: {
          name: Job.id,
        },
        spec: {
          ttlSecondsAfterFinished: 30,
          backoffLimit: 0,
          template: {
            spec: {
              restartPolicy: "Never",
              containers: [
                {
                  name: "worker",
                  image: "jkrishil/deploysphere-worker:test",
                  env: [
                    {
                      name: "JOB_JSON_BASE64",
                      value: JOB_JSON_BASE64,
                    },
                  ],
                  volumeMounts: [
                    {
                      name: "secret",
                      mountPath: "/app/.env",
                      subPath: ".env",
                    },
                  ],
                },
              ],
              volumes: [
                {
                  name: "secret",
                  secret: {
                    secretName: "deploysphere-secret",
                    items: [
                      {
                        key: ".env",
                        path: ".env",
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    };
  return batchV1ApiCreateNamespacedJobRequest;
};
