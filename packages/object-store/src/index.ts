import { BlobServiceClient } from "@azure/storage-blob";
import { env } from "@repo/env";
import fs from "fs";
import path from "path";

const blobServiceClient = BlobServiceClient.fromConnectionString(env.BLOB_CONNECTION_URL);
const containerClient = blobServiceClient.getContainerClient(env.BLOB_CONTAINER_NAME);

export const uploadFile = async (filename: string, filepath: string) => {
    const readStream = fs.createReadStream(filepath);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    await blockBlobClient.uploadStream(readStream);
}

export const downloadFolder = async (prefix: string, localpath: string) => {
    const blobs = containerClient.listBlobsFlat( { prefix } );
    for await (const blob of blobs) {
        const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
        console.log(blob.name);
        const filepath = path.join(localpath, blob.name);
        const dirname = path.dirname(filepath);
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
        }
        console.log(filepath);
    }
}
