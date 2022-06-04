#!/usr/bin/env node
const os = require("os");

// Fix deprecation issue in newer node versions.
os.tmpDir = os.tmpdir;

const spritesheet = require("spritesheet-js");

spritesheet(
  "src/sprites-src/**/*.png",
  {
    format: "json",
    name: "atlas",
    path: "src/assets",
    trim: false,
    powerOfTwo: true,
    square: false,
  },
  function (err) {
    if (err) throw err;

    console.log("atlas successfully generated");
  },
);
