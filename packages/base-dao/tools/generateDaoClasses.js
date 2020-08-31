const { lowerFirst, upperFirst } = require('lodash');
const pluralize = require('pluralize');
const { parseInternalTypes, generateCRUDSchemaFromInternalISDL } = require('@venncity/prisma-generate-schema');
const ejs = require('ejs');
const path = require('path');

function generateDaoClass(entityName) {
  return ejs.renderFile(path.resolve(__dirname, 'templates/daoClass.ejs'), {
    entityNameLowerFirstLetter: lowerFirst(entityName),
    entityNameUpperFirstLetter: upperFirst(entityName),
    entitiesNameLowerFirstLetter: lowerFirst(pluralize(entityName)),
    entitiesNameUpperFirstLetter: upperFirst(pluralize(entityName))
  });
}

async function generateDaoClasses(dataModel) {
  const sdl = parseInternalTypes(dataModel, 'postgres');
  const schema = generateCRUDSchemaFromInternalISDL(sdl, 'postgres');
  const { types } = sdl;
  const daoClasses = {};

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < types.length; i++) {
    const { isEnum, name } = types[i];
    const schemaType = schema.getType(name);
    if (!isEnum && schemaType) {
      // eslint-disable-next-line no-await-in-loop
      daoClasses[`${upperFirst(name)}DAO`] = await generateDaoClass(name);
    }
  }
  return daoClasses;
}

module.exports = generateDaoClasses;
