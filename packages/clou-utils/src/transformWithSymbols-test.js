const { isObject, isArray, isEmpty } = require('lodash');
const { transformer } = require('./transformWithSymbols');

describe('transformWithSymbols', () => {
  test('transform keys and values', () => {
    const obj = {
      a: 'a',
      b: 'b',
      c: {
        cc: 'cc',
        [Symbol('dd')]: 'dd'
      },
      e: ['ee', { ee: 'eee' }]
    };

    const result = transformer({
      transformKey: (v, k) => `k${k.toString()}`,
      transformValue: v => `v${v.toString()}`
    })(obj);

    expect(result).toEqual({
      ka: 'va',
      kb: 'vb',
      kc: {
        kcc: 'vcc',
        'kSymbol(dd)': 'vdd'
      },
      ke: ['vee', { kee: 'veee' }]
    });
  });

  test('cleanup empty values', () => {
    const obj = {
      a: 'a',
      b: undefined,
      c: null,
      d: ['d', undefined],
      e: [],
      f: {
        ff: [],
        fg: undefined
      },
      g: {}
    };

    const result = transformer({
      transformKey: (v, k) => {
        if (v === undefined || (isObject(v) && isEmpty(v)) || (isArray(v) && v.length === 0)) {
          return undefined;
        }
        return k;
      },
      transformArray: (array, key, transformFn) => {
        return array.filter(e => e !== undefined).map(transformFn);
      }
    })(obj);
    expect(result).toEqual({
      a: 'a',
      c: null,
      d: ['d'],
      f: {}
    });
  });
});
