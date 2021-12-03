const words = require("./words.json");
const https = require("https");
const IMAGE_DOMAIN = "https://s.sachmem.vn/public/dics_stable/";
const fs = require("fs");

const downloadSingleFile = async (imageRoot, content) => {
  let dirPath = `${process.cwd()}/download/images`;
  function mkDirIfNotExist() {
    const folders = imageRoot.split("/").filter((element) => element);
    if (folders?.length > 0) {
      for (const folder of folders) {
        dirPath = dirPath.concat(`/${folder}`);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
        }
      }
    }
  }
  let path = `${imageRoot}/${content}.jpg`;
  if (path[0] !== "/") path = "/" + path;
  const url = `${IMAGE_DOMAIN}${path}`;
  const desPath = `${process.cwd()}/download/images${path}`;
  mkDirIfNotExist();

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
};

const downloadAll = async () => {
  await Promise.all(
    words.map((element) => {
      return downloadSingleFile(element["imageRoot"], element["content"]);
    })
  );
};

downloadAll().then(() => {
  console.log("Completed");
});
