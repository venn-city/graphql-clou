const { upperFirst, omit } = require('lodash');
const paths = require('deepdash/paths');
const { sq } = require('@venncity/sequelize-model');
const { BELONGS_TO_MANY } = require('./../openCrudWhereTransform/sequelizeConsts').RELATION_TYPES;

function shouldLimitInFetch(args) {
  return true;
  // return args && !containsEveryOrNone(args.where);
}

function containsEveryOrNone(where) {
  return where && !paths(where).every(wherePath => !(wherePath.includes('_every') || wherePath.includes('_none')));
}

function limitAfterFetch(args, fetchedEntities) {
  // if (args && (args.first || args.skip)) {
  //   const start = args.skip || 0;
  //   const end = (args.first || 0) + start;
  //   fetchedEntities = fetchedEntities.slice(start, end);
  // }
  return fetchedEntities;
}

// TODO: for now omit these args as sequelize does not support them in nested nXm relations.
// https://github.com/sequelize/sequelize/issues/4376
function omitLimitArgsIfRequired(entityName, relationFieldName, args) {
  // const associationInfo = Object.values(sq[upperFirst(entityName)].associations).find(association => association.as === relationFieldName);
  // if (args && associationInfo.associationType === BELONGS_TO_MANY) {
  //   return omit(args, ['first', 'skip']);
  // }
  return args;
}

module.exports = {
  shouldLimitInFetch,
  limitAfterFetch,
  omitLimitArgsIfRequired
};
