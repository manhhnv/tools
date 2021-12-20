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

  const regex = /[!"#$%&'()*+,./:;<=>?@[\]^_`{|}~”“’‘’—◆​]/g;
  const matchSentences = (word) => {
    // if (word.content !== "informed decision") return
    const index = wordsInUnit.findIndex((e) => e._id === word._id);

    if (index !== -1) {

      const wordContent = String(word.content).trim().toLowerCase();

      const openBracketIndex = wordContent.indexOf("(");
      const closeBracketIndex = wordContent.indexOf(")");

      const results = { ...word };
      const sentences = [];
      const withoutPunctuation = new Set();

      let content = wordContent

      if (openBracketIndex !== -1 && closeBracketIndex !== -1) {
        content =  wordContent.slice(0, openBracketIndex) + wordContent.slice(closeBracketIndex + 1)
      }
      content = content.replace(regex, "").trim();

      const contentSplit = content.split(" ");
      // console.log("contentSplit", contentSplit);
      const meanings = word.meaning
        .toLowerCase()
        .toLowerCase()
        .split(/[\\,-\\(\\)]/)
        .map((e) => e.trim().replace(regex, "").replace("…", ""))
        .filter((e) => e);
      const prev = [...wordsInUnit.slice(0, index), ...prevWords];
      const prevWordsContent = prev.map((e) => e.content);
      const notMatchVi = [];
      const overMaxAllowedNewWords = [];
      for (const lm of text_lemmas) {
        if (text_lemmas.length <= 1) break;
        const en = lm.en.trim().replace(regex, "");
        const unlearned = new Set();
        let lemmas = lm.lemmas;

        lemmas = lemmas
          .map((e) => e.replace(regex, "").toLowerCase())
          .filter((e) => e.length > 1);
        lemmas = lemmas.filter((e) => isNaN(Number(e)));
        const vi = lm.vi.replace(regex, "");
        let contentCounter = 0;

        for (const item of contentSplit) {
          if (contentCounter === contentSplit.length) break;
          if (lemmas.includes(item)) {
            contentCounter = contentCounter + 1;
          }
        }
        if (contentCounter >= contentSplit.length) {
          // console.log("contentCounter", contentCounter)
          let isContainMeaning = false;
          if (book.grade >= 6) {
            lemmas = lemmas.filter((e) => !commonWords.includes(e));
          }
          for (const w_lm of lemmas) {
            if (unlearned.length > 2) break;
            if (
              prevWordsContent?.length == 0 ||
              !prevWordsContent.includes(w_lm)
            ) {
              unlearned.add(w_lm);
            }
          }
          for (const meaning of meanings) {
            if (vi.includes(meaning)) {
              isContainMeaning = true;
              break;
            }
          }
          // console.log("counter", unlearned.size)
          // console.log("unlearned", unlearned)
          // console.log("isContainMeaning", isContainMeaning)
          if (!isContainMeaning && unlearned.size <= 2) {
            notMatchVi.push({
              en: lm.en.trim(),
              vi: lm.vi.trim(),
              unlearned: unlearned,
              unlearnedCounter: unlearned.length,
              matchMeaning: isContainMeaning,
              viSplit: lm.vi.split(" ").length,
              enSplit: en.split(" ").length,
            });
            continue;
          }
          if (unlearned.size <= 2) {
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
          else {
            overMaxAllowedNewWords.push({
              en: lm.en.trim(),
              vi: lm.vi.trim(),
              unlearned: unlearned,
              unlearnedCounter: unlearned.length,
              matchMeaning: isContainMeaning,
              viSplit: lm.vi.split(" ").length,
              enSplit: en.split(" ").length,
            })
          }
        }
        else if (en.includes(content) && sentences.length < 10) {
          sentences.push({
            en: lm.en.trim(),
            vi: lm.vi.trim(),
            unlearned: unlearned,
            unlearnedCounter: 0,
            matchMeaning: true,
            viSplit: lm.vi.split(" ").length,
            enSplit: en.split(" ").length,
          });
        }
      }
      if (sentences?.length < 10) {
        const currentLen = 10 - sentences.length;
        sentences.push(...notMatchVi.slice(0, currentLen));
      }
      if (sentences?.length < 10) {
        const currentLen = 10 - sentences.length;
        sentences.push(...overMaxAllowedNewWords.slice(0, currentLen));
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

  const books = await booksCollection.find().toArray();
  // console.log(books);
  console.log(process.cwd());

  for (const book of books) {
    if (book.name === "Tiếng Anh 9 Tập 1") continue;
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
