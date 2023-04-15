import * as redis from "redis";

const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
};

export class PubSub {
  publisher;
  subscriber;
  blockchain;

  constructor() {
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscriber.subscribe(CHANNELS.TEST);
    this.subscriber.subscribe(CHANNELS.BLOCKCHAIN);
    this.subscriber.on("message", this.handleMessage.bind(this));
  }

  handleMessage(channel, message) {
    console.log(
      `Message received.\nMessage: ${message}\nChannel: ${channel}\n`
    );

    
  }

  publish({ channel, message }) {
    this.publisher.publish(channel, message);
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }
}
