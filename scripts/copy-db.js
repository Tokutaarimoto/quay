const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "data", "quay.db");
const destDir = path.join(__dirname, "..", ".next", "standalone", "data");
const dest = path.join(destDir, "quay.db");

if (fs.existsSync(src)) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("[Quay] DB copied to standalone output.");
} else {
  console.warn(
    "[Quay] data/quay.db not found. Run `npm run sync` first."
  );
}
