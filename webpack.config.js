const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    "background": "./background.js",
    "src/popup": "./src/popup.js",
    "src/options": "./src/options.js",
    "src/newtab": "./src/newtab.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "manifest.json", to: "." },
        { from: "popup.html", to: "." },
        { from: "options.html", to: "." },
        { from: "newtab.html", to: "." },
        { from: "blocked.html", to: "." },
        { from: "src/styles", to: "src/styles" },
        { from: "src/icons", to: "src/icons" },
      ],
    }),
  ],
};
