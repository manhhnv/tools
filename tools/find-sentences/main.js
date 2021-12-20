import createConnection from "./database";
import { findWords, allPrevWords } from "./words";
import text_lemmas from "./text_lemmas.json";
import fs from "fs";
import commonWords from "./common.json";

const main = async (book, unit, wordsCollection) => {
  const [wordsInUnit, prevWords] = await Promise.all([
    findWords(book.nId, unit.nId, wordsCollection),
    allPrevWords(book.nId, unit.nId, wordsCollection),
  ]);

  const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~”“’‘’—◆​]/g;
  const matchSentences = (word) => {
    const index = wordsInUnit.findIndex((e) => e._id === word._id);

    if (index !== -1) {
      const results = { ...word };
      const sentences = [];
      const withoutPunctuation = new Set();

      const content = String(word.content.trim().toLowerCase().replace(regex, ""));

      const contentSplit = content.split(" ");
      const meanings = word.meaning
        .toLowerCase()
        .toLowerCase()
        .split(/[\\,-\\(\\)]/)
        .map((e) => e.trim().replace(regex, "").replace("…", ""))
        .filter((e) => e);
      const prev = [...wordsInUnit.slice(0, index), ...prevWords];
      const prevWordsContent = prev.map((e) => e.content);
      const notMatchVi = [];
      for (const lm of text_lemmas) {
        if (text_lemmas.length <= 1) break;
        const en = lm.en.trim().replace(regex, "");
        const unlearned = [];
        let lemmas = lm.lemmas;

        lemmas = lemmas
          .map((e) => e.replace(regex, "").toLowerCase())
          .filter((e) => e.length > 1);
        lemmas = lemmas.filter((e) => isNaN(Number(e)));
        const vi = lm.vi.replace(regex, "");
        let contentCounter = 0;

        for (const item of contentSplit) {
          if (lemmas.includes(item)) {
            contentCounter = contentCounter + 1;
          }
        }
        if (contentCounter === contentSplit.length) {
          let isContainMeaning = false;
          if (book.grade >= 6) {
            lemmas = lemmas.filter((e) => !commonWords.includes(e));
          }
          let counter = 0;
          for (const w_lm of lemmas) {
            if (unlearned.length > 2) break;
            if (
              prevWordsContent?.length == 0 ||
              !prevWordsContent.includes(w_lm)
            ) {
              unlearned.push(w_lm);
              counter++;
            }
          }
          for (const meaning of meanings) {
            if (vi.includes(meaning)) {
              isContainMeaning = true;
              break;
            }
          }
          if (!isContainMeaning && counter <= 2) {
            notMatchVi.push({
              en: en,
              vi: lm.vi.trim(),
              unlearned: unlearned,
              unlearnedCounter: unlearned.length,
              matchMeaning: isContainMeaning,
              viSplit: lm.vi.split(" ").length,
              enSplit: en.split(" ").length,
            });
            continue;
          }
          if (counter <= 2) {
            if (!withoutPunctuation.has(en)) {
              sentences.push({
                en: lm.en.trim(),
                vi: lm.vi.trim(),
                unlearned: unlearned,
                unlearnedCounter: unlearned.length,
                matchMeaning: isContainMeaning,
                viSplit: lm.vi.split(" ").length,
                enSplit: en.split(" ").length,
              });
              withoutPunctuation.add(en);
            }
            continue;
          }
        }
      }
      if (sentences?.length < 10) {
        const currentLen = 10 - sentences.length;
        sentences.push(...notMatchVi.slice(0, currentLen));
      }
      results["sentences"] = [...sentences];
      return results;
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

  const books = await booksCollection.find({grade: 1}).toArray();
  // console.log(books);
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
