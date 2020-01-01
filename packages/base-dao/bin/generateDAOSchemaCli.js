#!/usr/bin/env node
const { argv } = require('yargs');
const { generateDAOSchema } = require('../tools/');

generateDAOSchema({ dataModelPath: argv.dataModelPath, generatedFolderPath: argv.generatedFolderPath });
