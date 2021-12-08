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
}
0;

async function findWords() {
  const client = await connectMongo();
  try {
    const dbo = client.db("tuvung");
    const wordsCollection = dbo.collection("words");
    const words = await wordsCollection
      .find({ bookNId: 10, unitNId: 4900 })
      .project({ content: 1, meaning: 1 })
      .toArray();
    await client.close();
    return words;
  } catch (error) {
    await client.close();
    throw error;
  }
}

async function parseSentence(sentence) {
  const pythonProcess = spawn("python3", ["./index.py", sentence]);
  return new Promise((resolve, reject) => {
    const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
    let result;
    pythonProcess.stdout
      .on("data", (chunk) => {
        result = chunk
          .toString()
          .split("\n")
          .map((el) => el.trim().replace(regex, ""))
          .filter((el) => el);
      })
      .on("error", (e) => {
        reject(e);
      })
      .on("end", () => {
        resolve(result);
      });
  });
}

async function main() {
  const [csvData, words] = await Promise.all([
    readCSV("/home/manhnv/Downloads/en-vi.csv"),
    findWords(),
  ]);

  const n = Math.floor(csvData.length / 100) + 1;
  const parsedData = [];

  const listContents = words.map((element) => element.content)
  words.includes

  for (const word of words) {
    for (let i = 0; i < n; i++) {
      const start = i * 100;
      const end = start + 100;
      const data = await Promise.all(
        csvData.slice(start, end).map((el) => {
          return parseSentence(el.en).then();
        })
      );
      console.log(data)
      parsedData.push(...data);
      for (let j = 0; j < parsedData.length; j++) {
        for (const content of listContents) {
          if (parsedData[j].includes(content)) {
            
          }
        }
      }
    }
  }

  fs.writeFile("./parsed.json", JSON.stringify(parsedData));

  function findMatchedSentences(en) {
    return new Promise((resolve, reject) => { });
  }
  console.log(csvData.length);
}

main().then(() => { });

module.exports = { connectMongo, findWords, readCSV, parseSentence };
