# Check points

Hello there, Catalog Team here. We hope you are comfortable and excited for the hackathon.

### Let’s jump straight into it

Following are the checkpoints you need to complete to finish the hackathon.

Refer this [document](https://raft.github.io/raft.pdf) for Raft consensus paper. It has all the details you need.

We recommend you to go through the paper and understand the concept before proceeding.

Refer the visualised demo here : [Visualiser](https://thesecretlivesofdata.com/raft/)

## 1. Ping Pong

_**Estimate time of completion : 3 hrs**_

Everyone should implement the following endpoints in a REST server.

**All You HAVE TO DO IS take in the request body and send the dummy responses mentioned below. You don’t need to implement the actual logic. Take in the request and send back the response. Don’t forget to handle those first class citizens (errors** 😅**).**

1.  Should have `/requestVote`

    Request Body:

    ```json
    {
    	"term": <uint>,
    	"candidateId": <uint>,
    	"lastLogIndex": <int>,
    	"lastLogTerm": <uint>
    }
    ```

    Response should be:

    ```json
    {
    	"term": <uint>,
    	"voteGranted": <bool>
    }
    ```

2.  Should have `/appendEntries`

    Request:

    ```json
    {
    	"term": <uint>,
    	"leaderId": <uint>,
    	"prevLogIndex": <int>,
    	"prevLogTerm": <uint>,
    	"entries": <[]{
    		"term": <uint>,
    		"command": <string>
    	}>
    	"leaderCommit": <uint>
    }
    ```

    Response:

    ```json
    {
    	"term": <uint>,
    	"success": <bool>
    }
    ```

3.  Should have `/executeCommand`

    ```
    Request Body:
    ```

```json
<string> // "SET 1 1"
```

Response:

```json
<string> // can be anything
```

## 2. Leader Election

_**Estimate time of completion : 6 hrs**_

Basically, you need to setup X nodes. Each node starts up as a follower and has a random timer **(1500-3000ms).** When this timer is done, the node becomes the CANDIDATE and request votes (now you gotta implement the logic for that) from all other nodes. If a node gets the majority of the votes, it becomes the LEADER and sends out heartbeat to all nodes. Refer the paper for all the technical details.

**By the end of this checkpoint, you will have nodes running and then leader election part done.**

## 3. Append entries

_**Estimate time of completion : 6 hrs**_

Once a leader has been elected, it begins servicing client requests. Each client request contains a command to be executed. The leader appends the command to its log as a new entry, then issues `appendEntries` in parallel to each of the other servers/nodes to replicate the log entry.

### Client Request

There should be a client, let’s say postman or anything which calls the leader’s

`/executeCommand` , which would add the command to log entries.

So, when your leader receives the command (checkout spec), it needs to add it in log entry as of this checkpoint. And then send those logs to all the nodes.

**By the end of this checkpoint, you should be able to handle request from client (`/executeCommand` ) and should send out all the logs to the nodes.**

**Example**:

Lets say we have 4 nodes, and node 1 is the leader, when node 1 receives the request executeCommand from client, it needs to add the command to the log entry and then send out the log to all other nodes.

## 4. Lost Nodes

_**Estimate time of completion : 3 hrs**_

If you came this far, you have a working system where single node becomes the leader, sends the heartbeats to all other nodes and also handle requests from client.

Now, what if a node crashed and then rejoined the network, in that case, the node needs to catch up the existing logs other nodes have. Yup. You are responsible for adding logic where a new node catches up with the existing node’s log entries.

Again refer the Raft paper. You don’t have to worry about VM right now.

## Virtual Machine

_**Estimate time of completion : 4 hrs**_

So far we have worked only with log entries. We have consensus on log entries.

But we need a VM. Think of VM as an array. It is as simple as that.

When the leader replicates all the logs on all the nodes, it commits the logs into the VM.

So lets say, we have following logs :

Logs = [ { term :1 , command: “SET 1 1”}]

The command in the above logs mean, we need to set 1 at index 1.

So, VM would be VM : [ _ , 1 , _ , _ …]

if the command is SET 0 10, then the VM would become

### VM = [10,1, _, _..]

Now, your job is to add VM to your nodes, when the leader replicates the logs in all nodes, commit the logs to VM and then inform others to do the same.

Again look into the paper.

## Specs

### Network Config

```json
{
  "node": {
    "id": 11890, // Should be <uint>
    "url": "<http://127.0.0.1:17080>"
  },
  "peers": [
    {
      "id": 44096, // Should be <uint>
      "url": "<http://localhost:23417>"
    },
    {
      "id": 43947, // Should be <uint>
      "url": "<http://127.0.0.1:13258>"
    }
  ] // Could be more peers
}
```

### Log

```json
{
  "term": 17, // Should be <uint>
  "command": "ADD 1 1" // <OP_CODE> <INDEX> <DATA>
}
```

### Virtual Machine

```json
{
  "state": [0, 0, 0, 0] // Should be array of <int>
}
```

### Supported log operations

Arithemetic log syntax : _**Operation result_index operand_1_Index operand_2_Index**_

1.  SET index_number value
2.  ADD result_index operand_1_Index operand_2_Index
3.  SUB result_index operand_1_Index operand_2_Index
4.  MUL result_index operand_1_Index operand_2_Index
5.  DIV result_index operand_1_Index operand_2_Index

Perform action on value stored in operand_1_Index with operand_2_Index and store it in result_index

Representation example : _**state[result_index] = state[operand_1_Index] operation state{operand_2_Index]**_

Example :

1.  Add 2 1 3

    initial state = [1 -2 2 0 6]

    state[2] = state[1] + state[3]

    final state = [1 -2 -2 0 6]

2.  MUL 2 2 4

    initial state = [1 -2 -2 0 6]

    state[2] = state[2] \* state[4]

    final state = [1 -2 -12 0 6]
