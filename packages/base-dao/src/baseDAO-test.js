const { hacker } = require('faker');
const { runGenericDAOTests } = require('./../test/baseTestForDAOs');

function buildTestObject() {
  return {
    name: hacker.phrase()
  };
}

describe('generic tests', () => {
  runGenericDAOTests({
    entityName: 'government',
    getDefaultEntityFunc: buildTestObject,
    stringFieldName: 'name'
  });
});
