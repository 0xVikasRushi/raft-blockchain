import express from "express";
import { MessageType, RaftNode } from "./raft-node";

const app = express();
app.use(express.json());

const PORT = process.argv[2];
console.log(typeof PORT);
const nodeId = PORT;

const raftNode = new RaftNode(nodeId);
raftNode.votingProcedure();

// TODO TRY CATCH VALIDATION
app.get("/", function (req, res) {
  res.send("working");
});

app.post("/requestVote", async (req, res) => {
  try {
    const { term, candidateId, lastLogIndex, lastLogTerm } = req.body;
    raftNode.clearTimeoutVoting();
    if (term < raftNode.currentTerm) {
      return res.json({ term: term, voteGranted: false });
    }
    return res.json({ term: term, voteGranted: true });
  } catch (error) {
    res.status(404).json({ error: error });
  }
});
app.post("/appendEntries", async (req, res) => {
  try {
    const {
      term,
      leaderId,
      prevLogIndex,
      prevLogTerm,
      entries: { term: term1, command: command1 },
      leaderCommit,
    } = req.body;

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
    return res.send(command);
  } catch (error) {
    return res.status(404).json({ error: error });
  }
});
app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
