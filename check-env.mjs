import fs from "node:fs";
const ignore=fs.readFileSync(".gitignore","utf8");
if(!ignore.includes(".env*")){console.error("ENV CHECK FAIL: .env* is not protected");process.exit(1)}
console.log("ENV CHECK PASS");
