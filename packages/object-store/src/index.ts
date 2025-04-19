import { BlobServiceClient } from "@azure/storage-blob";
import { env } from "@repo/env";
import fs from "fs";
import path from "path";
import mime from "mime";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  env.BLOB_CONNECTION_URL,
);
const containerClient = blobServiceClient.getContainerClient(
  env.BLOB_CONTAINER_NAME,
);

export const uploadFile = async (filename: string, filepath: string) => {
  const readStream = fs.createReadStream(filepath);
  const blockBlobClient = containerClient.getBlockBlobClient(filename);
  const contentType = mime.getType(filepath) || "application/octet-stream";
  await blockBlobClient.uploadStream(readStream, undefined, undefined, {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  });
};

const listBlobs = async (prefix: string) => {
  const blobs = containerClient.listBlobsFlat({ prefix });
  const blobsList: string[] = [];

  for await (const blob of blobs) {
    blobsList.push(blob.name);
  }

  return blobsList;
};

export const downloadProject = async (prefix: string, localpath: string) => {
  const blobsList = await listBlobs(prefix);

  const promiseArray = blobsList.map(async (blob) => {
    const blockBlobClient = containerClient.getBlockBlobClient(blob);
    const filepath = path.join(localpath, blob);

    const dirname = path.dirname(filepath);

    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    const blobResponse = await blockBlobClient.download();
    const writeStream = fs.createWriteStream(filepath);
    return new Promise<void>((resolve, reject) => {
      blobResponse.readableStreamBody
        ?.pipe(writeStream)
        .on("finish", () => resolve())
        .on("error", (error) => reject(error));
    });
  });

  await Promise.all(promiseArray);
};
