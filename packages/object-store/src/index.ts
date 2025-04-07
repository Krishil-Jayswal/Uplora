import { BlobServiceClient } from "@azure/storage-blob";
import { env } from "@repo/env";
import fs from "fs";

const blobServiceClient = BlobServiceClient.fromConnectionString(env.BLOB_CONNECTION_URL);
const containerClient = blobServiceClient.getContainerClient(env.BLOB_CONTAINER_NAME);

export const uploadFile = async (filename: string, filepath: string) => {
    const readStream = fs.createReadStream(filepath);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    await blockBlobClient.uploadStream(readStream);
}
