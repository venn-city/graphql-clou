const { hacker } = require('faker');
const { runGenericDAOTests } = require('./../test/baseTestForDAOs');
const createAllDAOs = require('./../test/DAOs');

function buildTestObject() {
  return {
    name: hacker.phrase()
  };
}

describe('generic tests', () => {
  runGenericDAOTests({
    entityName: 'government',
    createAllDAOs,
    getDefaultEntityFunc: buildTestObject,
    stringFieldName: 'name'
  });
});
