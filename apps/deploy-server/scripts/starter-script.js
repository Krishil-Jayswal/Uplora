import { pathToFileURL } from "url";
import { register } from "node:module";

register("ts-node/esm", pathToFileURL("."));

import("../src/index.ts");

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at: Promise", promise, "reason:", reason);
});
