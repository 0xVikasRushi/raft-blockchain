class RaftNode {
  constructor(id) {
    this.votedFor = null;
    this.currentTerm = 0;
    this.id = id;
    this.log = [];
    this.commitIndex = 0;
    this.lastApplied = 0;
    this.nextIndex = 0;
    this.matchIndex = 0;
    this.type = "follower";
  }

  AppendEntriesRPC(
    term,
    leaderId,
    prevLogIndex,
    prevLogTerm,
    entries, // array
    leaderCommit
  ) {}
  RequestVoteRPC(term, candidateId, lastLogIndex, lastLogTerm) {}
}

export default RaftNode;
