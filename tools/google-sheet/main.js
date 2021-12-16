import googleAuthorize from "./authorize";
import { GoogleSpreadsheetAPI } from "./sheet";
import * as fs from "fs";
import * as path from "path";

const main = async () => {
  const auth = await googleAuthorize();
  const ID = "1dapFuealb9jTVMOM6w7qUMRI6X6J5kK0480yWRWyHUc";
  const googlSheet = new GoogleSpreadsheetAPI(ID, auth);

  const source = path.resolve(process.cwd(), "data");

  const dirs = fs
    .readdirSync(source, { withFileTypes: true })
    .filter((e) => e.isDirectory());

  const listNames = dirs.map((e) => e.name);
  // console.log(listNames);
  async function write(dir) {
    const sheetData = [
      [
        "word_id",
        "từ tiếng anh",
        "nghĩa tiếng việt",
        "câu tiếng anh",
        "câu tiếng việt",
        "trùng nghĩa",
        "số từ en",
        "số từ vi",
      ],
    ];
    const temp = [];
    const directory = path.resolve(process.cwd(), "data", dir);
    let files = walkFiles(directory);
    // console.log(files)
    // files = files.slice(10, 15);
    for (const file of files) {
      const rawData = fs.readFileSync(file);
      const data = JSON.parse(rawData);
      for (const item of data.items) {
        if (item.sentences?.length > 0) {
          item.sentences.forEach((sentence) => {
            sheetData.push([
              item._id,
              item.content,
              item.meaning,
              sentence.en,
              sentence.vi,
              sentence.matchMeaning,
              String(sentence.enSplit),
              String(sentence.viSplit),
            ]);
          });
        } else {
          temp.push([item._id, item.content, item.meaning]);
        }
      }
    }
    sheetData.push(...temp);
    await googlSheet.clearAll(dir);
    await googlSheet.writeAll(dir, sheetData);
    // console.log(`${i}/${listNames.length}`);
  }
  await write('Tiếng Anh 9 Tập 2')
};

const walkFiles = (directory) => {
  const results = [];
  const files = fs.readdirSync(directory, {
    encoding: "utf-8",
    withFileTypes: true,
  });
  files.forEach((file) => {
    // console.log(file)
    const statPath = path.resolve(directory, file.name);
    if (file.isDirectory()) {
      const res = walkFiles(statPath);
      results.push(...res);
    } else if (file.isFile()) {
      results.push(statPath);
    }
  });
  return results;
};

main().catch((e) => {
  console.error(e);
});
