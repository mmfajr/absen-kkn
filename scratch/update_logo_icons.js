const fs = require("fs");
const path = require("path");

const publicIconsDir = path.join(__dirname, "../public/icons");
const publicDir = path.join(__dirname, "../public");
const srcAppDir = path.join(__dirname, "../src/app");
const logoPath = path.join(publicIconsDir, "Logo KKN Mentos.png");

if (fs.existsSync(logoPath)) {
  // Copy to public/icons
  fs.copyFileSync(logoPath, path.join(publicIconsDir, "icon-192.png"));
  fs.copyFileSync(logoPath, path.join(publicIconsDir, "icon-512.png"));
  fs.copyFileSync(logoPath, path.join(publicIconsDir, "apple-touch-icon.png"));

  // Copy to public root
  fs.copyFileSync(logoPath, path.join(publicDir, "favicon.ico"));
  fs.copyFileSync(logoPath, path.join(publicDir, "favicon.png"));
  fs.copyFileSync(logoPath, path.join(publicDir, "icon.png"));

  // Copy to src/app root (Next.js App Router metadata icons)
  fs.copyFileSync(logoPath, path.join(srcAppDir, "favicon.ico"));
  fs.copyFileSync(logoPath, path.join(srcAppDir, "icon.png"));
  fs.copyFileSync(logoPath, path.join(srcAppDir, "apple-icon.png"));

  console.log("Successfully updated all favicon & app icons in src/app and public!");
} else {
  console.error("Logo KKN Mentos.png not found");
}
