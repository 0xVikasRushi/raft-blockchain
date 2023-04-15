import * as redis from "redis";
import { RaftNode } from "./raft-node";

const CHANNELS = {
  RAFT: "RAFT",
};

export class PubSub {
  publisher;
  subscriber;

  constructor() {
    this.publisher = redis.createClient();
    this.publisher.connect()
    this.subscriber = redis.createClient();
    this.subscriber.connect()

    this.subscriber.subscribe(CHANNELS.RAFT, this.handleMessage.bind(this));
  }

  handleMessage(channel: string, message: string) {
    console.log(
      `Message received.\nMessage: ${message}\nChannel: ${channel}\n`
    );
  }

  publish({ channel, message }: { channel: string, message: string }) {
    this.publisher.publish(channel, message);
  }

  sendMessageToAll({ body }: {
    body: any
  }) {
    this.publish({
      channel: CHANNELS.RAFT,
      message: JSON.stringify(body)
    })
  }

}
