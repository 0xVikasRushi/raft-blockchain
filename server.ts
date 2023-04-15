import axios from "axios";
import express from "express";
import { NodeType, RaftNode } from "./raft-node";
const app = express();
app.use(express.json());

const PORT = process.argv[2];
console.log(typeof PORT);
const nodeId = PORT;

const raftNode = new RaftNode(nodeId);

// TODO TRY CATCH VALIDATION
app.get("/", function (req, res) {
  res.send("working");
});

app.post("/requestVote", async (req, res) => {
  try {
    const { term, candidateId, lastLogIndex, lastLogTerm } = req.body;
    raftNode.timer.stop();
    if (term < raftNode.currentTerm) {
      return res.json({ term: term, voteGranted: false });
    }
    if (
      raftNode.votedFor === null ||
      raftNode.votedFor === candidateId /* TODO: another condition */
    )
      return res.json({ term: term, voteGranted: true });
  } catch (error) {
    res.status(404).json({ error: error });
  }
});

// TODO REMOVE THIS ANS ADD THIS IN APPENDENTRIES RPC
// app.post("/heartBeats", async (req, res) => {
//   const { heartBeatFrom } = req.body;
// });

app.post("/appendEntries", async (req, res) => {
  try {
    const {
      from,
      term,
      leaderId,
      prevLogIndex,
      prevLogTerm,
      entries,
      leaderCommit,
    } = req.body;
    // hearbeat
    if (entries.length === 0) {
      console.log(`Received HeartBeat from ID ${from}`);
      raftNode.leader = from;
      raftNode.timer.reset();
    } else {
      console.log("not heartbeat", entries);

      if (raftNode.type === NodeType.candidate) {
        raftNode.type = NodeType.follower;
      }
      if (term < raftNode.currentTerm) {
        return res.json({ term: term, success: false });
      }
      if (raftNode.log[prevLogIndex]?.term !== prevLogTerm) {
        return res.json({ term: term, success: false });
      }
      // TODO: 3
      // TODO: 4
      if (leaderCommit > raftNode.commitIndex) {
        raftNode.commitIndex = Math.min(
          leaderCommit,
          /*not sure*/ prevLogIndex
        );
      }
    }

    res.json({ term: term, success: true });
  } catch (error) {
    res.status(404).json({ error: error });
  }
});

app.post("/executeCommand", async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(404).json({ message: "command not found" });
    }
    raftNode.log.push({ term: raftNode.commitIndex, command });
    const promises = raftNode.peer.map((p) => {
      console.log(raftNode.log, "is the log in ", raftNode.id);

      return axios.post(`http://localhost:${p}/appendEntries`, {
        from: raftNode.id,
        term: raftNode.currentTerm,
        leaderId: raftNode.leader,
        prevLogIndex: raftNode.log[raftNode.log.length - 1],
        prevLogTerm: raftNode.log[raftNode.log.length - 1]?.term,
        entries: raftNode.log,
        leaderCommit: raftNode.commitIndex,
      });
    });

    const response = (await Promise.allSettled(promises)) as any;
    console.log(response.value?.data);

    return res.send(command);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error });
  }
});
app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
