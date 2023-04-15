import axios from "axios";
import { PubSub } from "./pubSub";
import { pubsub } from "./server";
import { getTimeout } from "./utils";

enum NodeType {
  follower = "follower",
  candidate = "candidate",
  leader = "leader",
}

export class RaftNode {
  id: string;
  currentTerm: number;
  votedFor: string | null;
  log: any[];
  type: NodeType;
  peer: string[];

  constructor(id: string) {
    this.id = id;
    this.votedFor = null;
    this.currentTerm = 0;
    this.log = [];
    this.type = NodeType.follower;
    this.peer = ["3001", "3002", "3003", "3004"].filter((p) => p !== this.id);
  }

  async votingProcedure() {
    // there's a time out
    const timeout = getTimeout();
    console.log({ timeout });
    setTimeout(() => {
      // after timeout

      // becomes candidate

      // const promise = await axios.post()
      const promises = this.peer.map((p) => {
        return axios.post(`http://localhost:${p}/message`, {
          from: this.id,
          message: "candidate",
        });
      });

      Promise.all(promises).then((res) => {
        console.log(res.map((r) => r.data));
      });
    }, timeout);
    // asks for votes
    // ...
    // becomes leader
  }
}
