import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("ts-node/esm", pathToFileURL("."));

import("../src/index.ts");

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at: Promise", promise, "reason:", reason);
});
