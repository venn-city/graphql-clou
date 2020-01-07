const { sq } = require('@venncity/sequelize-model');
const { shouldLimitInFetch, limitAfterFetch, omitLimitArgsIfRequired } = require('./resultLimiter');
const models = require('./../../../../test/model');

sq.init(models);

describe('resultLimiter', () => {
  test('shouldLimitInFetch', () => {
    expect(shouldLimitInFetch({ where: { a: 'a', b_every: 'b' } })).toBeFalsy();
    expect(shouldLimitInFetch({ where: { a: 'a', aa: { b_every: 'b' } } })).toBeFalsy();
    expect(shouldLimitInFetch({ where: { b_none: 'b' } })).toBeFalsy();
    expect(shouldLimitInFetch()).toBeFalsy();

    // expect(shouldLimitInFetch({ where: { none: 'n' } })).toBeTruthy();
    // expect(shouldLimitInFetch({ where: { a: 'a' } })).toBeTruthy();
  });

  test('limitAfterFetch', () => {
    const fetchedResults = ['a', 'b', 'c', 'd', 'e', 'f', 'f'];
    const limitedResult = limitAfterFetch({ first: 3, skip: 2 }, fetchedResults);
    expect(limitedResult).toEqual(['c', 'd', 'e']);
    expect(limitAfterFetch(null, fetchedResults)).toEqual(fetchedResults);
  });

  test('omitLimitArgs', () => {
    const argsWithoutLimit = omitLimitArgsIfRequired('Minister', 'votes', { where: 'a', first: 5, skip: 3 });
    expect(argsWithoutLimit).toEqual({ where: 'a' });

    const argsWithLimit = omitLimitArgsIfRequired('Minister', 'ministry', { where: 'b', first: 5, skip: 3 });
    expect(argsWithLimit).toEqual({ where: 'b', first: 5, skip: 3 });
  });
});
