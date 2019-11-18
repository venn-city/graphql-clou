const utils = require('./generalUtils');

describe('utils', () => {
  describe('isTrue', () => {
    test('Should handle boolean values correctly', () => {
      expect(utils.isTrue(true)).toBeTruthy();
      expect(utils.isTrue(false)).toBeFalsy();
    });
    test('Should handle string values correctly', () => {
      expect(utils.isTrue('true')).toBeTruthy();
      expect(utils.isTrue('false')).toBeFalsy();
    });
  });
  describe('isFalse', () => {
    test('Should handle boolean values correctly', () => {
      expect(utils.isFalse(true)).toBeFalsy();
      expect(utils.isFalse(false)).toBeTruthy();
    });
    test('Should handle string values correctly', () => {
      expect(utils.isFalse('true')).toBeFalsy();
      expect(utils.isFalse('false')).toBeTruthy();
    });
  });
  describe('generateRandomString', () => {
    test('should generate random string with given length', () => {
      expect(utils.generateRandomString()).toHaveLength(15);
      expect(utils.generateRandomString(5)).toHaveLength(5);
    });
  });
  test('decrypt should return original value', () => {
    const originalData = utils.generateRandomInteger(10).toString();
    const encryptedData = utils.encrypt(originalData);
    const decryptedData = utils.decrypt(encryptedData);
    expect(decryptedData).toEqual(originalData);
  });
  test('encrypt output should not be the same input', () => {
    const originalData = utils.generateRandomString(20);
    const encryptedData = utils.encrypt(originalData);
    const encryptedDataSecond = utils.encrypt(originalData);
    expect(encryptedData).not.toEqual(encryptedDataSecond);
  });

  describe('extractWhereFromFederationReference', () => {
    test('should succesfully delete the __typename key from the given object', () => {
      const reference = {
        id: utils.generateRandomInteger(),
        __typename: 'SomeType'
      };
      const extractedWhere = utils.extractWhereFromFederationReference(reference);

      expect(extractedWhere).toHaveProperty('id', reference.id);
      expect(extractedWhere).not.toHaveProperty('__typename');
    });
  });

  test('extracts request headers correctly', () => {
    const test = {
      headers: {
        xrayTraceId: undefined,
        servicename: 'serviceName',
        functionName: 'functionName',
        onBehalfOfUser: 'bla123',
        impersonated: 'false'
      },
      body: {
        query: 'query blah blah blah',
        variables: {
          hail: 'satan'
        }
      }
    };
    const result = utils.getAdditionalInfoFromRequest(test);
    expect(result).toEqual({
      graphqlQuery: 'query blah blah blah',
      graphqlVariables: JSON.stringify(test.body.variables),
      xrayTraceId: null,
      serviceName: 'serviceName',
      functionName: 'functionName',
      onBehalfOfUser: 'bla123',
      impersonated: 'false'
    });
  });
  test('extracting request headers doesnt crash when headers are falsy', () => {
    const test = {};
    const result = utils.getAdditionalInfoFromRequest(test);
    expect(result).toEqual({
      graphqlQuery: null,
      graphqlVariables: null,
      xrayTraceId: null,
      serviceName: null,
      functionName: null,
      onBehalfOfUser: null,
      impersonated: null
    });
  });
});
