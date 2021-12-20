import { GoogleSpreadsheetAPI } from "../google-sheet/sheet";
import googleAuthorize from "../google-sheet/authorize";

export function standardize(data) {
  const emojiRegex = /[◆​♫▪♪•*]/g;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let en = row[3]?.trim()?.replace(emojiRegex, "");
    let vi = row[4]?.trim()?.replace(emojiRegex, "");

    if (en && vi) {
      if (en[0] === "-") {
        en = en.slice(1);
      }
      if (vi[0] === "-") {
        vi = vi.slice(1);
      }
    }
    data[i][3] = en?.trim();
    data[i][4] = vi?.trim();
  }
}

const main = async (sheetName) => {
  const googleAuth = await googleAuthorize();
  const sheetId = "1dapFuealb9jTVMOM6w7qUMRI6X6J5kK0480yWRWyHUc";

  const googleSheetAPI = new GoogleSpreadsheetAPI(sheetId, googleAuth);

  const data = await googleSheetAPI.getSheet(sheetName);

  const regex = /[!"#$%&'()*+,./:;<=>?@[\]^_`{|}~”“’‘’—◆​♫]/g;

  const emojiRegex = /[◆​♫▪♪•*]/g;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let en = row[3]?.trim()?.replace(emojiRegex, "");
    let vi = row[4]?.trim()?.replace(emojiRegex, "");

    if (en && vi) {
      if (en[0] === "-") {
        en = en.slice(1);
      }
      if (vi[0] === "-") {
        vi = vi.slice(1);
      }
    }
    data[i][3] = en?.trim();
    data[i][4] = vi?.trim();
  }
  await googleSheetAPI.clearAll(sheetName);
  await googleSheetAPI.writeAll(sheetName, data);
};

// main("Tiếng Anh 2 (CT GDPT 2018) - Global Success").catch((e) => {
//   console.error(e);
// });
