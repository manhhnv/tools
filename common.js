// import { fstat, readdirSync, readFile, readFileSync, writeFileSync } from 'fs';

// var a = readFileSync("./common.txt");

// const common = a.toString().split('\n')
// writeFileSync("./common.json", JSON.stringify(common))
var str = "sự độc lập, tự lập"
console.log(str.split(/[\\,-\\(\\)]/).map((e) => e.trim()))