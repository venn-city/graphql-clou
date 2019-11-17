const { createEntityDAO } = require('./baseDAO');
const { runGenericDAOTests, BASE_DAO_TEST_TYPES } = require('./../test/baseTestForDAOs');

module.exports = {
  createEntityDAO,
  runGenericDAOTests,
  BASE_DAO_TEST_TYPES
};
