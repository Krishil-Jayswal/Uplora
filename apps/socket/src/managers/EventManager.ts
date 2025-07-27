import { keymanager } from "@repo/redis/managers";
import { subscriber } from "@repo/redis/subscriber";
import { UserManager } from "./UserManager.js";

export class EventManager {
  private static instance: EventManager;
  private subscriptions: Map<string, string[]>;
  private reversesubscriptions: Map<string, string[]>;

  private constructor() {
    this.subscriptions = new Map();
    this.reversesubscriptions = new Map();
    this.addListeners();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new EventManager();
    }
    return this.instance;
  }

  public subscribe(userId: string, projectId: string) {
    const channel = keymanager.getChannelKey(projectId);
    if (this.subscriptions.get(userId)?.includes(channel)) {
      return;
    }
    this.subscriptions.set(
      userId,
      (this.subscriptions.get(userId) || []).concat(channel),
    );
    this.reversesubscriptions.set(
      channel,
      (this.reversesubscriptions.get(channel) || []).concat(userId),
    );
    if (this.reversesubscriptions.get(channel)?.length === 1) {
      subscriber.subscribe(channel);
    }
  }

  public unsubscribe(userId: string, channel: string) {
    const subscriptions = this.subscriptions.get(userId);
    const reversesubscriptions = this.subscriptions.get(channel);
    if (subscriptions)
      this.subscriptions.set(
        userId,
        subscriptions.filter((subscription) => subscription !== channel),
      );
    if (reversesubscriptions)
      this.reversesubscriptions.set(
        channel,
        reversesubscriptions.filter((subscriber) => subscriber !== userId),
      );
    if (this.reversesubscriptions.get(channel)?.length === 0) {
      this.reversesubscriptions.delete(channel);
      subscriber.unsubscribe(channel);
    }
  }

  public userLeft(userId: string) {
    this.subscriptions
      .get(userId)
      ?.forEach((channel) => this.unsubscribe(userId, channel));
  }

  private addListeners() {
    subscriber.on("message", (channel, message) => {
      this.reversesubscriptions.get(channel)?.forEach((userId) => {
        UserManager.getInstance().getUser(userId)?.emit({ message });
      });
    });

    subscriber.on("ready", () => {
      for (const channel of this.reversesubscriptions.keys()) {
        subscriber.subscribe(channel);
      }
    });
  }
}
