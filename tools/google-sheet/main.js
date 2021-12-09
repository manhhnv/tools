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

};

main().catch((e) => {
  console.error(e);
});
