import { env } from "@repo/env";
import { WebSocketServer } from "ws";
import { UserManager } from "./managers/UserManager.js";

const PORT = env.WS_PORT;

const wss = new WebSocketServer({ port: Number(PORT) });

wss.on("connection", (socket, req) => {
  UserManager.getInstance().addUser(socket, req);
});

wss.on("error", (error) => {
  console.error("Error in socket server: ", error);
  process.exit(1);
});

console.log(`Socket server is running on port ${PORT}.`);
