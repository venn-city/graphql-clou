let { shouldLimitInFetch, limitAfterFetch, omitLimitArgs } = require('./resultLimiter');

describe('resultLimiter', () => {
  test('shouldLimitInFetch', () => {
    expect(shouldLimitInFetch({ where: { a: 'a', b_every: 'b' } })).toBeTruthy();
    expect(shouldLimitInFetch({ where: { a: 'a', aa: { b_every: 'b' } } })).toBeTruthy();
    expect(shouldLimitInFetch({ where: { b_none: 'b' } })).toBeTruthy();

    expect(shouldLimitInFetch({ where: { none: 'n' } })).toBeFalsy();
    expect(shouldLimitInFetch({ where: { a: 'a' } })).toBeFalsy();
    expect(shouldLimitInFetch()).toBeFalsy();
  });

  test('limitAfterFetch', () => {
    let fetchedResults = ['a', 'b', 'c', 'd', 'e', 'f', 'f'];
    let limitedResult = limitAfterFetch({ first: 3, skip: 2 }, fetchedResults);
    expect(limitedResult).toEqual(['c', 'd', 'e']);
    expect(limitAfterFetch(null, fetchedResults)).toEqual(fetchedResults);
  });

  test('omitLimitArgs', () => {
    let argsWithoutLimit = omitLimitArgs('Minister', 'votes', { where: 'a', first: 5, skip: 3 });
    expect(argsWithoutLimit).toEqual({ where: 'a' });

    let argsWithLimit = omitLimitArgs('Minister', 'ministry', { where: 'b', first: 5, skip: 3 });
    expect(argsWithLimit).toEqual({ where: 'b', first: 5, skip: 3 });
  });
});
