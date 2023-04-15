import { v4 as uuidv4 } from "uuid";
import express from "express";
import { RaftNode } from "./raft-node";
import { PubSub } from "./pubSub";

const app = express();
app.use(express.json());

const PORT = process.argv[2];
console.log(typeof PORT);
const nodeId = PORT;
export const pubsub = new PubSub();
const raftNode = new RaftNode(nodeId);
raftNode.votingProcedure();

// TODO TRY CATCH VALIDATION
app.get("/", function (req, res) {
  res.send("working");
});

app.post("/requestvote", async (req, res) => {
  try {
    const { term, candidateId, lastLogIndex, lastLogTerm } = req.body;
    res.json({ term: term, voteGranted: true });
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

app.post("/message", async (req, res) => {
  const { message } = req.body;
  
  res.json(req.body);
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
