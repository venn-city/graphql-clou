const crypto = require('crypto');
const { isEmpty, isArray, every, isUndefined } = require('lodash');
const config = require('@venncity/nested-config')(__dirname);

const encryptionKey = Buffer.from(JSON.parse(config.get('encryption.key')));
const encryptionAlgorithm = config.get('encryption.algorithm');
const inputEncoding = config.get('encryption.inputEncoding');
const outputEncoding = config.get('encryption.outputEncoding');

const IV_LENGTH = 16;

function generateRandomString(length = 15) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function generateRandomInteger(length = 15) {
  return Math.floor(Math.random() * 10 ** length);
}
/**
 * Checks if boolean or string is true.
 * Useful for checking config values which can be either string or boolean.
 */
function isTrue(valueToCheck) {
  return valueToCheck && valueToCheck.toString() === 'true';
}

function isFalse(valueToCheck) {
  return !isTrue(valueToCheck);
}

function encrypt(data) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(encryptionAlgorithm, Buffer.from(encryptionKey), iv);
  let encryptedData = cipher.update(data, inputEncoding, outputEncoding);
  encryptedData += cipher.final(outputEncoding);
  const authTag = cipher.getAuthTag();
  return `${iv.toString(outputEncoding)}${encryptedData}${authTag.toString(outputEncoding)}`;
}

function decrypt(data) {
  const dataBuffer = Buffer.from(data, outputEncoding);
  const dataLength = dataBuffer.length;
  const iv = dataBuffer.slice(0, IV_LENGTH);
  const encryptedData = dataBuffer.slice(IV_LENGTH, dataLength - IV_LENGTH);
  const authTag = dataBuffer.slice(dataLength - IV_LENGTH, dataLength);
  const decipher = crypto.createDecipheriv(encryptionAlgorithm, Buffer.from(encryptionKey), iv);
  decipher.setAuthTag(authTag);
  const decrypted = decipher.update(encryptedData, outputEncoding, inputEncoding);
  return decrypted;
}

function getAdditionalInfoFromHeaders(req) {
  const xrayTraceId = req.headers.xrayTraceId || req.headers.xraytraceid || null;
  const serviceName = req.headers.serviceName || req.headers.servicename || null;
  const functionName = req.headers.functionName || req.headers.functionname || null;
  const onBehalfOfUser = req.headers.onBehalfOfUser || req.headers.onbehalfofuser || null;
  const impersonated = req.headers.impersonated || null;

  return { xrayTraceId, serviceName, functionName, onBehalfOfUser, impersonated };
}

function extractWhereFromFederationReference(reference) {
  const where = {
    ...reference
  };
  // eslint-disable-next-line no-underscore-dangle
  delete where.__typename;
  return where;
}

function isEmptyArray(sqWhereElements) {
  return isArray(sqWhereElements) && (isEmpty(sqWhereElements) || every(sqWhereElements, isUndefined));
}

module.exports = {
  generateRandomString,
  generateRandomInteger,
  isTrue,
  isFalse,
  encrypt,
  decrypt,
  getAdditionalInfoFromHeaders,
  extractWhereFromFederationReference,
  isEmptyArray
};
