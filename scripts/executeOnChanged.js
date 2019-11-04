#!/usr/bin/env node

/* eslint-disable no-shadow */
const { execSync } = require("child_process");
const fs = require("fs");

const [, , ...commandsWordsArray] = process.argv;
const scriptToExecute = commandsWordsArray
  .map(escapeVariableArguments)
  .join(" ");
console.log(`About to execute script: ${scriptToExecute}`);
const changedPackages = getChangedPackages().map(obj => obj.name);
if (!changedPackages.length) {
  console.log("No changed packages found, skipping execution.");
  process.exit(0);
}
console.log(
  `Executing command on the following packages: ${changedPackages.join(",")}`
);
execSync(
  `${scriptToExecute} ${changedPackages
    .map(name => `--scope ${name}`)
    .join(" ")}`,
  { stdio: "inherit" }
);

// eslint-disable-next-line consistent-return
function getChangedPackages() {
  // for CI, we don't want the changes occurring on the CI will affect changes calculation, the CI save initial changes to lerna-changed.temp
  if (fs.existsSync("./lerna-changed.temp")) {
    console.log("found lerna-changed.temp, deducting changes based on it.");
    const changesFromFile = fs.readFileSync("./lerna-changed.temp");
    if (!changesFromFile.length) {
      return [];
    }
    const changedPackages = JSON.parse(changesFromFile);
    return changedPackages;
  }
  // otherwise decide changes based on lerna changed as usual
  try {
    const changedPackagesRawText = execSync("lerna changed --json");
    const changedPackages = JSON.parse(changedPackagesRawText.toString());
    return changedPackages;
  } catch (error) {
    if (error.toString().includes("No changed packages found")) {
      return [];
    }
    process.exit(1);
  }
}

function escapeVariableArguments(arg) {
  return arg.replace(/\$/g, "\\$");
}
