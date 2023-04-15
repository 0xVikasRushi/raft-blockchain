import express from "express";
const app = express();

const port = process.argv[2];

app.use(express.json());

app.get("/", function (req, res) {
  res.send("working ");
});

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
