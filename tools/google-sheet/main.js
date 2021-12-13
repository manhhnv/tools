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
  listNames.forEach(async (e, i) => {
    const directory = path.resolve(process.cwd(), "data", e);
    const files = walkFiles(directory);
    const rawData = fs.readFileSync(files[0]);
    const data = JSON.parse(rawData);
    const sheetData = [["word_id", "content", "meaning", "en", "vi", "unlearned"]];
    for (const item of data.items) {
      item.sentences.forEach((sentence) => {
        sheetData.push([
          item._id,
          item.content,
          item.meaning,
          sentence.en,
          sentence.vi,
          JSON.stringify(sentence.unlearned)
        ]);
      });
    }
    await googlSheet.clearAll(e);
    await googlSheet.writeAll(e, sheetData);
    console.log(`${i}/${listNames.length}`);
  });
};

const walkFiles = (directory) => {
  const results = [];
  const files = fs.readdirSync(directory, {
    encoding: "utf-8",
    withFileTypes: true,
  });
  files.forEach((file) => {
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
