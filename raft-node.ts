import axios from "axios";
import { getTimeout, countTrue, countVotes } from "./utils";

export enum MessageType {
  gatherVotes = "gatherVotes",
}

interface LogEntry {
  term: number;
  command: string;
}

enum NodeType {
  follower = "follower",
  candidate = "candidate",
  leader = "leader",
}

export class RaftNode {
  id: string;
  currentTerm: number;
  votedFor: string | null;
  log: LogEntry[];
  type: NodeType;
  peer: string[];

  //  -----
  timeoutId: any;

  constructor(id: string) {
    this.id = id;
    this.votedFor = null;
    this.currentTerm = 0;
    this.log = [];
    this.type = NodeType.follower;
    this.peer = ["3001", "3002", "3003", "3004"].filter((p) => p !== this.id);
  }

  clearTimeoutVoting() {
    clearTimeout(this.timeoutId);
  }

  async sendHeartBeats() {
    setInterval(() => {
      // console.log("here");
      const promises = this.peer.map((p) => {
        return axios.post(`http://localhost:${p}/heartBeats`, {
          heartBeatFrom: this.id,
        });
      });
      Promise.all(promises).then(() => {
        console.log("HeartBeat SENT");
      });
    }, 5000);
  }

  async votingProcedure() {
    this.currentTerm++;
    this.votedFor = this.id;
    // there's a time out
    const timeout = getTimeout();
    console.log({ timeout });
    this.timeoutId = setTimeout(() => {
      // after timeout

      // becomes candidate
      this.type = NodeType.candidate;
      const promises = this.peer.map((p) => {
        return axios.post(`http://localhost:${p}/requestVote`, {
          term: this.currentTerm,
          candidateId: this.id,
          lastLogIndex: this.log.length - 1,
          lastLogTerm: this.log[this.log.length - 1]?.term,
        });
      });

      Promise.all(promises).then((results) => {
        const res = results.map((r) => r.data);
        console.log(res);

        const votes = countVotes(res);
        console.log(votes);

        if (votes.trueCount > votes.falseCount) {
          this.type = NodeType.leader;
        }
        if ((this.type = NodeType.leader)) {
          this.sendHeartBeats();
        }
      });
    }, timeout);

    // await this.sendHeartBeats();
    // asks for votes
    // ...
    // becomes leader
  }
}
