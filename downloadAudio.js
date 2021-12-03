const sentences = require("./sentences.json");
const fs = require("fs");
const https = require("https");

async function main() {
  const download = async (url) => {
    const arr = url.split("/");
    const name = arr[arr.length - 1];
    const desPath = `${process.cwd()}/download/audios/${name}`;

    if (!fs.existsSync(desPath)) {
      const filePath = fs.createWriteStream(desPath, { mode: 777 });
      https.get(url, (res) => {
        if (!fs.existsSync(desPath)) {
          const filePath = fs.createWriteStream(desPath, { mode: 777 });
          res.pipe(filePath);
          filePath.on("finish", () => {
            filePath.close();
          });
          filePath.on("error", (e) => {
            if (e) {
              console.log(e);
            }
          });
        }
      });
    }
  };
  await Promise.all(sentences.map((element) => download(element["audio"])));
}

main().then(() => {});
