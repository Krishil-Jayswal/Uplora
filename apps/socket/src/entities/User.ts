import { SubscribeMessageSchema } from "@repo/validation";
import { WebSocket } from "ws";
import { EventManager } from "../managers/EventManager.js";
import { prisma } from "@repo/db";

export class User {
  private userId: string;
  private socket: WebSocket;

  constructor(userId: string, socket: WebSocket) {
    this.userId = userId;
    this.socket = socket;
    this.addListeners();
  }

  public emit(message: Record<string, string>) {
    this.socket.send(JSON.stringify(message));
  }

  private addListeners() {
    this.socket.on("message", async (data) => {
      try {
        const message = SubscribeMessageSchema.parse(
          JSON.parse(data.toString()),
        );
        const project = await prisma.project.findUnique({
          where: {
            id: message.projectId,
            ownerId: this.userId,
          },
          select: {
            id: true,
          },
        });
        if (!project) return;
        EventManager.getInstance().subscribe(this.userId, message.projectId);
      } catch (error) {
        console.error("Error in message handler: ", (error as Error).message);
        this.emit({ message: "Invalid data format." });
      }
    });
  }
}
