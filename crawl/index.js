const driver = require("mongodb");
const csv = require("csv-parser");
const fs = require("fs");
const spawn = require("child_process").spawn;

const url = "mongodb://localhost:27017/tuvung";

function readCSV(path) {
  return new Promise((resolve, reject) => {
    const result = [];
    fs.createReadStream(path)
      .pipe(csv({ headers: false }))
      .on("data", (row) => {
        const en = row["0"];
        const vi = row["1"];
        result.push({ en: ` ${en} `, vi: ` ${vi} ` });
      })
      .on("error", (e) => {
        reject(e);
      })
      .on("end", () => {
        resolve(result);
      });
  });
}

async function connectMongo() {
  const mongoClient = new driver.MongoClient(url);
  await mongoClient.connect();
  return mongoClient;
}0

async function findWords() {
  const client = await connectMongo();
  try {
    const dbo = client.db("tuvung");
    const wordsCollection = dbo.collection("words");
    const words = await wordsCollection
      .find({})
      .project({ content: 1, meaning: 1 })
      .toArray();child_process
    
    await client.close();
  } catch (error) {
    await client.close();
    throw error;
  }
}

const pythonProcess = spawn('python3',["./index.py", "hello"]);

console.log("running");

pythonProcess.stdout.on("data", (chunk) => {
  console.log(chunk.toString());
}).on("error", (e) => {
  console.log(e);
})


module.exports = { connectMongo, findWords, readCSV };
