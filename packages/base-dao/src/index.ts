import {
  createEntityDAO as createEntityDAOOriginal,
  getFunctionNamesForEntity as getFunctionNamesForEntityOriginal,
  transformJoinedEntityWhere as transformJoinedEntityWhereOriginal
} from './baseDAO';
import { runGenericDAOTests as runGenericDAOTestsOriginal, BASE_DAO_TEST_TYPES as BASE_DAO_TEST_TYPES_ORIGINAL } from './baseTestForDAOs';

export const createEntityDAO = createEntityDAOOriginal;
export const runGenericDAOTests = runGenericDAOTestsOriginal;
export const getFunctionNamesForEntity = getFunctionNamesForEntityOriginal;
export const transformJoinedEntityWhere = transformJoinedEntityWhereOriginal;
export const BASE_DAO_TEST_TYPES = BASE_DAO_TEST_TYPES_ORIGINAL;

export default {
  createEntityDAO: createEntityDAOOriginal,
  runGenericDAOTests: runGenericDAOTestsOriginal,
  getFunctionNamesForEntity: getFunctionNamesForEntityOriginal,
  transformJoinedEntityWhere: transformJoinedEntityWhereOriginal,
  BASE_DAO_TEST_TYPES: BASE_DAO_TEST_TYPES_ORIGINAL
};
