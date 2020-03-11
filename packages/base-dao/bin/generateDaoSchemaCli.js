#!/usr/bin/env node
const { argv } = require('yargs');
const { generateDaoSchema } = require('../tools/');

generateDaoSchema({
  dataModelPath: argv.dataModelPath,
  whiteListPath: argv.whiteListPath,
  generatedFolderPath: argv.generatedFolderPath,
  cleanFolder: argv.cleanFolder
});
