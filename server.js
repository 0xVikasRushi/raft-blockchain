// import express from "express";
const express = require("express");

const app = express();

const port = 3000;

app.use(express.json());


app.post('/requestvote',async(req,res)=>{
  try {
    const { term , candidateId , lastLogIndex ,lastLogTerm } = req.body;
    res.json({term:term,voteGranted:true})
  } catch (error) {
    res.status(404).json({error:error})
  }
})
app.post('/appendEntries',async(req,res)=>{
  try {
    const { term , leaderId , prevLogIndex ,prevLogTerm , entries:{term:term1 , command:command1} ,leaderCommit  } = req.body;
    res.json({term:term,success:true})
  } catch (error) {
    res.status(404).json({error:error})
  }
})

app.get("/", function (req, res) {
  res.send("working ");
});

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
