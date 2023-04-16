import { RaftNode } from "./raft-node";

export interface RequestVoteReqBody {
  term: RaftNode["currentTerm"];
  candidateId: RaftNode["id"];
  lastLogIndex: number;
  lastLogTerm: RaftNode["currentTerm"];
}

export interface AppendEntriesReqBody {
  from: RaftNode["id"];
  term: RaftNode["currentTerm"];
  leaderId: RaftNode["id"];
  prevLogIndex: number;
  prevLogTerm: RaftNode["currentTerm"];
  entries: RaftNode["log"];
  leaderCommit: number;
}

export interface LogEntry {
  term: number;
  command: string;
}

export interface Vote {
  term: number;
  voteGranted: boolean;
}
