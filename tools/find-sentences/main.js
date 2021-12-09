/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import createConnection from "./database";
import { findWords, allPrevWords } from "./words";
import text_lemmas from "./text_lemmas.json";
import fs from "fs";

const main = async (book, unit, wordsCollection) => {
  //   const connection = await createConnection();
  //   const dbo = connection.db("tuvung");
  //   const wordsCollection = dbo.collection("words");
  const [wordsInUnit, prevWords] = await Promise.all([
    findWords(book.nId, unit.nId, wordsCollection),
    allPrevWords(book.nId, unit.nId, wordsCollection),
  ]);
  const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
  const matchSentences = (word) => {
    const index = wordsInUnit.findIndex((e) => e._id === word._id);
    if (index !== -1) {
      const results = { ...word };
      const sentences = [];
      const withoutPunctuation = new Set();

      const { content } = word;
      const meaning = word.meaning.toLowerCase();
      const prev = [...wordsInUnit.slice(0, index), ...prevWords];
      const prevContents = prev.map((e) => e.content);
      for (const lm of text_lemmas) {
        if (text_lemmas.length <= 1) break;
        let lemmas = lm.lemmas;
        const translate = lm.vi.toLowerCase();
        if (lemmas.includes(content) && translate.includes(meaning)) {
          lemmas = lemmas.map((e) => e.replace(regex, "")).filter((e) => e);
          let counter = 0;
          for (const w_lm of lemmas) {
            if (counter > 2) break;
            if (!prevContents.includes(w_lm)) {
              counter++;
            }
          }
          if (counter <= 2) {
            const en = lm.en.trim().replace(regex, "");
            const vi = lm.vi.trim().replace(regex, "");
            if (!withoutPunctuation.has(en)) {
              sentences.push({
                en: en,
                vi: vi,
              });
              withoutPunctuation.add(en);
            }
          }
        }
      }
      results["sentences"] = [...sentences];
      return [...sentences].length > 0 ? results : null;
    } else {
      return null;
    }
  };
  const results = { items: [], total: 0, unit: unit.name };
  for (const word of wordsInUnit) {
    const result = matchSentences(word);
    if (result) {
      results.items.push(result);
      for (const item of results.items) {
        results.total += item.sentences.length;
      }
    }
  }
  const dirPath = process.cwd() + `/data/${book.name}`;
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  const filePath = dirPath + `/${unit._id}.json`;
  fs.writeFile(filePath, JSON.stringify(results), function (err) {
    if (err) throw err;
    console.log(`Done ${book.name} - ${unit.name}`);
  });
};

const root = async () => {
  const connection = await createConnection();
  const dbo = connection.db("tuvung");
  const wordsCollection = dbo.collection("words");
  const booksCollection = dbo.collection("books");

  const books = await booksCollection.find().toArray();
  console.log(process.cwd());

  for (const book of books) {
    const units = book.units;
    for (const unit of units) {
      await main(book, unit, wordsCollection);
    }
  }
  await connection.close();
};

root().catch((e) => {
  throw e;
});
