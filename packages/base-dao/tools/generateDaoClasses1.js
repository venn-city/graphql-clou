const { lowerFirst, upperFirst } = require('lodash');
const pluralize = require('pluralize');
const prismaGenerateSchema = require('prisma-generate-schema');
const ejs = require('ejs');
const path = require('path');

function generateDaoClass(entityName) {
  return ejs.renderFile(path.resolve(__dirname, 'templates/DAOClass.ejs'), {
    entityNameLowerFirstLetter: lowerFirst(entityName),
    entityNameUpperFirstLetter: upperFirst(entityName),
    entitiesNameLowerFirstLetter: lowerFirst(pluralize(entityName)),
    entitiesNameUpperFirstLetter: upperFirst(pluralize(entityName))
  });
}

async function generateDaoClasses(dataModel) {
  const { types } = prismaGenerateSchema.parseInternalTypes(dataModel, 'postgres');
  const daoClasses = {};

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < types.length; i++) {
    const { isEnum, name } = types[i];
    if (!isEnum) {
      // eslint-disable-next-line no-await-in-loop
      daoClasses[`${upperFirst(name)}DAO`] = await generateDaoClass(name);
    }
  }
  return daoClasses;
}

module.exports = generateDaoClasses;
