import { v4 as uuidv4 } from 'uuid'
import express from 'express';
import { RaftNode } from './raft-node';
import { PubSub } from './pubSub';

const app = express();
app.use(express.json());

const PORT = process.argv[2];
const nodeId = PORT;
export const pubsub = new PubSub();
const raftNode = new RaftNode(nodeId);
raftNode.votingProcedure();

app.get("/", function (req, res) {
  res.send("working");
});

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});