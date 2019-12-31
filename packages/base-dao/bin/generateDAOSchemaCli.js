#!/usr/bin/env node
const { argv } = require('yargs');
const { generateDAOSchema } = require('../tools/');

generateDAOSchema(argv.dataModelPath, argv.generatedFolder);
