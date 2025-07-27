import { WebSocket } from "ws";
import { User } from "../entities/User.js";
import { IncomingMessage } from "http";
import { verifyToken } from "@repo/jwt";
import { EventManager } from "./EventManager.js";

export class UserManager {
  private static instance: UserManager;
  private users: Map<string, User>;

  private constructor() {
    this.users = new Map();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new UserManager();
    }
    return this.instance;
  }

  public addUser(socket: WebSocket, req: IncomingMessage) {
    const params = new URLSearchParams(req.url?.split("?")[1]);
    const token = params.get("token");

    if (!token) {
      socket.send(JSON.stringify({ message: "No token provided." }));
      socket.close();
      return;
    }

    let userId: string;
    try {
      userId = verifyToken(token).id;
    } catch (error) {
      console.error("Error in verifying token: ", (error as Error).message);
      socket.send(JSON.stringify({ message: "Unauthorized: Token expired." }));
      socket.close();
      return;
    }
    this.users.set(userId, new User(userId, socket));
    this.registerOnClose(userId, socket);
  }

  public getUser(userId: string) {
    return this.users.get(userId);
  }

  private registerOnClose(userId: string, socket: WebSocket) {
    socket.on("close", () => {
      this.users.delete(userId);
      EventManager.getInstance().userLeft(userId);
    });
  }
}
