const { createEntityDAO, getFunctionNamesForEntity, transformJoinedEntityWhere } = require('./baseDAO');
const { runGenericDAOTests, BASE_DAO_TEST_TYPES } = require('./../test/baseTestForDAOs');

module.exports = {
  createEntityDAO,
  runGenericDAOTests,
  getFunctionNamesForEntity,
  transformJoinedEntityWhere,
  BASE_DAO_TEST_TYPES
};
