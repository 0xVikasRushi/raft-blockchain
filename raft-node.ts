import { PubSub } from './pubSub';
import { pubsub } from './server';
import { getTimeout } from './utils';
enum NodeType {
  follower = 'follower',
  candidate = 'candidate',
  leader = 'leader',
}

export class RaftNode {
  id: string;
  currentTerm: number;
  votedFor: string | null;
  log: any[];
  type: NodeType

  constructor(id: string) {
    this.id = id;
    this.votedFor = null;
    this.currentTerm = 0;
    this.log = [];
    this.type = NodeType.follower;
  }

  votingProcedure() {
    // there's a time out
    const timeout = getTimeout();
    console.log({ timeout })
    setTimeout(() => {
      // after timeout

      // becomes candidate
      pubsub.sendMessageToAll({
        body: {
          from: this.id,
          message: "im a candidate"
        }
      });
    }, timeout);
    // asks for votes
    // ...
    // becomes leader
  }


}
