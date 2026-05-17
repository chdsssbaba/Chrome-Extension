const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const DIST = path.join(__dirname, "dist");

function cleanDist() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST, { recursive: true });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function build() {
  console.log("Building Productivity Suite...\n");

  cleanDist();
  console.log("  Cleaned dist/");

  const rootFiles = [
    "manifest.json",
    "background.js",
    "popup.html",
    "options.html",
    "newtab.html",
    "blocked.html"
  ];

  for (const file of rootFiles) {
    if (fs.existsSync(path.join(__dirname, file))) {
      fs.copyFileSync(path.join(__dirname, file), path.join(DIST, file));
    }
  }
  console.log("  Copied root files -> dist/");

  copyRecursive(SRC, path.join(DIST, "src"));
  console.log("  Copied src/ -> dist/src/");

  const manifestPath = path.join(DIST, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    console.log(`  Manifest: ${manifest.name} v${manifest.version}`);
    console.log(`  Permissions: ${manifest.permissions.join(", ")}`);
  }

  console.log("\nBuild complete!");
  console.log("Load the dist/ folder as an unpacked extension in Chrome.");
  console.log("  1. Go to chrome://extensions");
  console.log("  2. Enable Developer mode");
  console.log('  3. Click "Load unpacked" and select the dist/ folder');
}

build();
