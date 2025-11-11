const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// middleWare
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xyz4gji.mongodb.net/?appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const db = client.db("fixitDb");
    const issuesCollection = db.collection("issues");

    app.get("/issues", async (req, res) => {
      const email = req.query.email;

      const query = {};
      if (email) {
        query.email = email;
      }

      const result = await issuesCollection.find(query).toArray();

      res.send(result);
    });

    app.get("/filterIssue", async (req, res) => {
      const { category, status } = req.query;
      const query = {};
      if (category) {
        query.category = category;
      }
      if (status) {
        query.status = status;
      }

      const result = await issuesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/latestIssue", async (req, res) => {
      const result = await issuesCollection
        .find()
        .sort({ date: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.post("/issues", async (req, res) => {
      const newIssue = req.body;
      const result = await issuesCollection.insertOne(newIssue);
      res.send(result);
    });

    app.put("/issues/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: data,
      };

      const result = await issuesCollection.updateOne(query, update);

      res.send(result);
    });

    app.delete("/issues/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await issuesCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
