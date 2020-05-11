/* eslint-disable no-unused-vars */
const { isObject } = require('lodash');

function defaultTransformObject(object, key, transform, transformKey) {
  const transformedObject = {};
  [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)].forEach(objectKey => {
    const transformedKey = transformKey(object[objectKey], objectKey);
    if (transformedKey !== undefined) {
      transformedObject[transformedKey] = transform(object[objectKey], objectKey);
    }
  });
  return transformedObject;
}

function defaultTransformArray(array, key, transformFn) {
  return array.map(transformFn);
}

function transformer({
  transformers = [],
  transformKey = (v, k) => k,
  transformValue = (v, k) => v,
  transformArray = defaultTransformArray,
  transformObject = defaultTransformObject
}) {
  function transform(value, key) {
    const tranformer = transformers.find(({ cond }) => {
      return cond(value);
    });
    if (tranformer) {
      return tranformer.func(value, key, transform);
    }
    if (Array.isArray(value)) {
      return transformArray(value, key, transform);
    }
    if (isObject(value)) {
      return transformObject(value, key, transform, transformKey);
    }
    return transformValue(value, key, transform);
  }

  return transform;
}

module.exports = {
  transformer
};
