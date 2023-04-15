import axios, { AxiosError } from "axios";
import { getTimeout, countTrue, countVotes } from "./utils";
import { Timer } from "./timer";

export enum MessageType {
  gatherVotes = "gatherVotes",
}

interface LogEntry {
  term: number;
  command: string;
}

export enum NodeType {
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
  commitIndex: number;

  //  -----
  timer: Timer;
  leader: RaftNode | null;
  constructor(id: string) {
    this.timer = new Timer();
    this.id = id;
    this.votedFor = null;
    this.currentTerm = 0;
    this.log = [];
    this.type = NodeType.follower;
    this.peer = ["3001", "3002", "3003", "3004", "3005"].filter(
      (p) => p !== this.id
    );
    this.leader = null;
    this.commitIndex = 0;

    this.timer.start(getTimeout());
    console.log(this.timer.randTime);

    this.timer.on("timeout", this.handleTimeout.bind(this));
  }

  handleTimeout() {
    this.timer.stop();

    // becomes candidate
    this.type = NodeType.candidate;
    this.votingProcedure();
  }

  async sendHeartBeats() {
    setInterval(() => {
      const promises = this.peer.map((p) => {
        return axios.post(`http://localhost:${p}/appendEntries`, {
          from: this.id,
          term: this.currentTerm,
          leaderId: this.id,
          prevLogTerm: this.log[this.log.length - 1]?.term,
          entries: [],
          leaderCommit: this.commitIndex,
        });
      });
      Promise.allSettled(promises).then(() => {
        console.log("HeartBeat SENT");
      });
    }, 1000);
  }

  async votingProcedure() {
    console.log(`Voting process started by ${this.id}`);

    this.currentTerm++;
    this.votedFor = this.id;
    const promises = this.peer.map((p) => {
      console.log("sent to " + p);
      return axios.post(`http://localhost:${p}/requestVote`, {
        term: this.currentTerm,
        candidateId: this.id,
        lastLogIndex: this.log.length - 1,
        lastLogTerm: this.log[this.log.length - 1]?.term,
      });
    });

    const results = await Promise.allSettled(promises);
    const filtered = results.filter((p) => p.status !== "rejected");
    const res = filtered.map((res) => {
      const res_ = res as any;
      const val = res_.value as any;
      console.log(val.data, typeof val.data);
      return val.data;
    });
    const votes = countVotes(res);
    console.log(votes);
    if (
      this.type === NodeType.candidate &&
      votes.trueCount + 1 > Math.floor(this.peer.length / 2)
    ) {
      this.type = NodeType.leader;
    }
    if ((this.type = NodeType.leader)) {
      this.sendHeartBeats();
    }

    // await this.sendHeartBeats();
    // asks for votes
    // ...
    // becomes leader
  }
}
