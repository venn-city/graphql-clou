/* eslint-disable import/no-extraneous-dependencies */
const [dataModelPathArg, openCRUDOutputPathArg] = process.argv.slice(2);
const { readFileSync, writeFileSync } = require('fs');
const { generateCRUDSchema } = require('prisma-generate-schema');
const { printSchema } = require('graphql');

const dataModelPath = dataModelPathArg || './src/schema/datamodel.graphql';
const openCRUDOutputPath = openCRUDOutputPathArg || './src/schema/openCRUD.graphql';
const modelInSDL = readFileSync(dataModelPath, 'utf8');
const openCRUDSchema = generateCRUDSchema(modelInSDL, 'postgres');

const stringSchema = printSchema(openCRUDSchema);
writeFileSync(openCRUDOutputPath, stringSchema);
