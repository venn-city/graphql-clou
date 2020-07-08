import transformWithSymbolsOriginal from './transformWithSymbols';
import generalUtils from './generalUtils';

const {
  generateRandomString: generateRandomStringOriginal,
  generateRandomInteger: generateRandomIntegerOriginal,
  isTrue: isTrueOriginal,
  isFalse: isFalseOriginal,
  encrypt: encryptOriginal,
  decrypt: decryptOriginal,
  getAdditionalInfoFromRequest: getAdditionalInfoFromRequestOriginal,
  extractWhereFromFederationReference: extractWhereFromFederationReferenceOriginal,
  isEmptyArray: isEmptyArrayOriginal
} = generalUtils;

export const generateRandomString = generateRandomStringOriginal;
export const generateRandomInteger = generateRandomIntegerOriginal;
export const isTrue = isTrueOriginal;
export const isFalse = isFalseOriginal;
export const encrypt = encryptOriginal;
export const decrypt = decryptOriginal;
export const getAdditionalInfoFromRequest = getAdditionalInfoFromRequestOriginal;
export const extractWhereFromFederationReference = extractWhereFromFederationReferenceOriginal;
export const isEmptyArray = isEmptyArrayOriginal;
export const transformWithSymbols = transformWithSymbolsOriginal;

export default {
  ...generalUtils,
  transformWithSymbols: transformWithSymbolsOriginal
};
