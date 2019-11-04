const path = require("path");
const { execSync } = require("child_process");

const buffer = execSync("yarn workspaces info --json");
const info = JSON.parse(buffer.toString());
const infoData = JSON.parse(info.data);

function getPackageNameByFile(filePath, scriptName) {
  const filePathNormalized = path.normalize(filePath);
  const packageNames = Object.keys(infoData);
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < packageNames.length; i++) {
    const packageName = packageNames[i];
    const locationPath = infoData[packageName].location;
    const locationPathNormalized = path.normalize(
      path.resolve(__dirname, "..", locationPath)
    );
    // eslint-disable-next-line import/no-dynamic-require,global-require
    const packageJson = require(`${locationPathNormalized}/package.json`);
    const scripts = packageJson.scripts || {};
    const isFileInPackage = filePathNormalized.startsWith(
      locationPathNormalized
    );
    const hasScript = !!scripts[scriptName];
    if (isFileInPackage && hasScript) {
      return packageName;
    }
  }
  return null;
}

function createLintStagedConfig(scriptName, args = "") {
  return filenames => {
    const relevantPackages = {};
    filenames.forEach(fileName => {
      const packageName = getPackageNameByFile(fileName, scriptName);
      if (packageName !== null) {
        relevantPackages[packageName] = true;
      }
    });
    const pkgs = Object.keys(relevantPackages);
    if (pkgs.length === 0) {
      return "echo";
    }
    return [
      `lerna exec --concurrency 1 --scope ${pkgs.join(
        ","
      )} -- yarn ${scriptName} ${args}`,
      "git add"
    ];
  };
}

module.exports = {
  "packages/**/*.{js,jsx,ts,tsx}": createLintStagedConfig("lint", "--fix")
};
