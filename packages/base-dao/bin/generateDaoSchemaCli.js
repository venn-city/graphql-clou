#!/usr/bin/env node
const yargs = require('yargs');

yargs.boolean('cleanFolder');
const { argv } = yargs;
const { generateDaoSchema } = require('../tools');

generateDaoSchema({
  dataModelPath: argv.dataModelPath,
  whiteListPath: argv.whiteListPath,
  generatedFolderPath: argv.generatedFolderPath,
  cleanFolder: argv.cleanFolder
});
