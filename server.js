import express from "express";
import RaftNode from "./raftNode.js";
import { v4 as uuidv4 } from "uuid";
import getTimeout from "./utils.js";
import { PubSub } from "./pubSub.js";

const nodeAddress = uuidv4().split("-").join("");

const app = express();
const pubsub = new PubSub();

const port = process.argv[2];

app.use(express.json());

const timeout = getTimeout();
console.log(timeout);
const b1 = new RaftNode("1" + nodeAddress);
setTimeout(() => {
  b1.type = "candidate";
  pubsub.publish({
    channel: "BLOCKCHAIN",
    message: nodeAddress + "IM A LEADER",
  });
}, timeout);

app.get("/", function (req, res) {
  res.send("working ");
});

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
