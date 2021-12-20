import { google } from "googleapis";

export class GoogleSpreadsheetAPI {
  constructor(spreadsheetId, auth) {
    this.spreadsheetId = spreadsheetId;
    this.auth = auth;
    this.sheetsV4 = google.sheets({ version: "v4", auth: auth });
  }

  async createSheets(listNames) {
    if (listNames.length > 0) {
      const request = {
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [],
        },
      };
      listNames.forEach((element) => {
        request.requestBody.requests.push({
          addSheet: { properties: { title: element } },
        });
      });
      await this.sheetsV4.spreadsheets.batchUpdate(request);
    }
  }

  async clearAll(sheetName) {
    const param = {
      spreadsheetId: this.spreadsheetId,
      range: sheetName,
    };
    await this.sheetsV4.spreadsheets.values.clear(param);
  }

  async writeAll(sheetName, data, append = false) {
    if (sheetName.trim() || data?.length > 0) {
      const param = {
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}`,
        requestBody: {
          range: `${sheetName}`,
          values: data,
        },
        valueInputOption: "USER_ENTERED",
      };
      if (append) await this.sheetsV4.spreadsheets.values.append(param);
      else await this.sheetsV4.spreadsheets.values.update(param);
    }
  }

  async getSheet(sheetName) {
    const res = await this.sheetsV4.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}`,
    });
    return res.data.values;
  }
}
