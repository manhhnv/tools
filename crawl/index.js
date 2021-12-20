const driver = require('mongodb');
const csv = require('csv-parser');
const fs = require('fs');
const { spawn } = require('child_process');
// const lemmasData = require('./text_lemmas.json');

const url = 'mongodb://localhost:27017/tuvung';

function readCSV(path) {
  return new Promise((resolve, reject) => {
    const result = [];
    fs.createReadStream(path)
      .pipe(csv({ headers: false }))
      .on('data', (row) => {
        const en = String(row['1']).trim();
        const vi = String(row['2']).trim();
        result.push({ en, vi });
      })
      .on('error', (e) => {
        reject(e);
      })
      .on('end', () => {
        resolve(result);
      });
  });
}

readCSV('/home/manhnv/Downloads/raw_data.csv').then((r) => {
  console.log(r.length);
  console.log(r[1000]);
  fs.writeFileSync('data.json', JSON.stringify(r));
})

async function connectMongo() {
  const mongoClient = new driver.MongoClient(url);
  await mongoClient.connect();
  return mongoClient;
}


async function findWords() {
  const client = await connectMongo();
  try {
    const dbo = client.db('tuvung');
    const wordsCollection = dbo.collection('words');
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
  const pythonProcess = spawn('python3', ['./index.py', sentence]);
  return new Promise((resolve, reject) => {
    const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
    let result;
    pythonProcess.stdout
      .on('data', (chunk) => {
        result = chunk
          .toString()
          .split('\n')
          .map((el) => el.trim().replace(regex, ''))
          .filter((el) => el);
      })
      .on('error', (e) => {
        reject(e);
      })
      .on('end', () => {
        resolve(result);
      });
  });
}

async function main() {
  const client = await connectMongo();
  try {
    const dbo = client.db('tuvung');
    const wordsCollection = dbo.collection('words');
    const words = await wordsCollection
      .find({ bookNId: 10, unitNId: 4900 })
      .project({ content: 1, meaning: 1, _id: 1 })
      .toArray();
    const results = [];
    for (const w of words) {
      const r = { ...w };
      const sentences = [];
      const { content } = w;
      const meaning = w.meaning.toLowerCase();
      for (const lm of lemmasData) {
        const { lemmas } = lm;
        const translate = lm.vi.toLowerCase();
        if (lemmas.includes(content) && translate.includes(meaning)) {
          sentences.push(lm.en);
        }
      }
      r.sentences = sentences;
      results.push(r);
    }
    fs.writeFileSync('output.json', JSON.stringify(results));
    await client.close();
  } catch (error) {
    await client.close();
    throw error;
  }
}

// main().then(() => {});

const getBooks = async () => {
  const client = await connectMongo();
  try {
    const dbo = client.db('tuvung');
    const booksCollection = dbo.collection('books');
    const books = await booksCollection
      .find({})
      .project({ _id: 1, name: 1 })
      .toArray();
    fs.writeFileSync('books.json', JSON.stringify(books));
    await client.close();
    return words;
  } catch (error) {
    await client.close();
    throw error;
  }
};

// getBooks().then(() => {})

module.exports = {
  connectMongo, findWords, readCSV, parseSentence,
};
