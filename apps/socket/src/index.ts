import { env } from "@repo/env";
import { WebSocketServer, WebSocket } from "ws";
import { verifyToken } from "@repo/jwt";

const PORT = env.WS_PORT;

const userSockets = new Map<string, WebSocket>();

const wss = new WebSocketServer({ port: Number(PORT) });

wss.on("connection", (socket, req) => {
  const params = new URLSearchParams(req.url?.split("?")[1]);
  const token = params.get("token");

  if (!token) {
    socket.send(JSON.stringify({ message: "No token provided." }));
    socket.close();
    return;
  }

  let userId: string;
  try {
    const { id } = verifyToken(token);
    userId = id;
  } catch (error) {
    console.error("Error in verifying token: ", (error as Error).message);
    socket.send(JSON.stringify({ message: "Unauthorized: Token expired." }));
    socket.close();
    return;
  }

  userSockets.set(userId, socket);
  console.log(`User: ${userId} connected.`);

  socket.on("message", (data) => {
    try {
      console.log(JSON.parse(data.toString()));
    } catch (error) {
      console.error("Error in message handler: ", (error as Error).message);
      socket.send(JSON.stringify({ message: "Invalid data format." }));
    }
  });

  socket.on("close", () => {
    userSockets.delete(userId);
    console.log(`User: ${userId} disconnected.`);
  });
});

wss.on("error", (error) => {
  console.error("Error in socket server: ", error);
  process.exit(1);
});

console.log(`Socket server is running on port ${PORT}.`);
