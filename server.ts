import axios from "axios";
import express from "express";
import { NodeType, RaftNode } from "./raft-node";
import { AppendEntriesReqBody, RequestVoteReqBody } from "./types";

const app = express();
app.use(express.json());

const PORT = process.argv[2];
const nodeId = PORT;

const raftNode = new RaftNode(nodeId);

app.get("/", function (req, res) {
  res.send("working");
});

app.post("/requestVote", async (req, res) => {
  try {
    const { term, candidateId, lastLogIndex, lastLogTerm }: RequestVoteReqBody =
      req.body;
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

function exc(str: string) {
  const cmd: string[] = str.split(" ");

  const command = cmd[0];
  // TODO: handle invalid inputs
  const operands = cmd.slice(1).map((operand) => parseInt(operand));

  if (command === "SET") {
    raftNode.state[operands[0]] = operands[1];
  } else {
    switch (command) {
      case "ADD":
        raftNode.state[operands[0]] =
          raftNode.state[operands[1]] + raftNode.state[operands[2]];
        break;

      case "SUB":
        raftNode.state[operands[0]] =
          raftNode.state[operands[1]] - raftNode.state[operands[2]];
        break;
      case "MUL":
        raftNode.state[operands[0]] =
          raftNode.state[operands[1]] * raftNode.state[operands[2]];
        break;
      case "DIV":
        raftNode.state[operands[0]] =
          raftNode.state[operands[1]] / raftNode.state[operands[2]];
        break;

      default:
        break;
    }
  }
}

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
    }: AppendEntriesReqBody = req.body;
    // heart beat
    if (entries.length === 0) {
      console.log(`Received HeartBeat from ID ${from}`);
      raftNode.leader = from;
      raftNode.timer.reset();
    } else {
      console.log("Log entries:  ", entries);
      console.log("State before: ", raftNode.state);
      entries
        .map((e) => e.command)
        .forEach((c) => {
          exc(c);
        });
      console.log("State after:  ", raftNode.state);

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
    const {
      command,
    }: {
      command: "string";
    } = req.body;

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

    const response = await Promise.allSettled(promises);

    response.map((k: any) => {
      k.value?.data !== undefined, console.log(k.value?.data);
    });

    return res.send(raftNode.log);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
