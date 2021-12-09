import { google } from "googleapis";
import * as path from "path";

const googleAuthorize = async () => {
  const scopes = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive",
  ];

  const keyFile = path.resolve(
    "tools/google-sheet/google_service_account.json"
  );

  const client = new google.auth.JWT({
    keyFile,
    scopes,
  });
  await client
    .authorize()
    .then(() => {
      console.log("Authorized");
    })
    .catch((e) => {
      throw e;
    });
  return client;
};

export default googleAuthorize;
