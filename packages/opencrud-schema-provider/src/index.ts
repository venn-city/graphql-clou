import {
  openCrudDataModel as openCrudDataModelOriginal,
  openCrudSchema as openCrudSchemaOriginal,
  openCrudSchemaGraphql as openCrudSchemaGraphqlOriginal,
  getOpenCrudIntrospection as getOpenCrudIntrospectionOriginal
} from './openCRUDSchemaProvider/openCRUDSchemaProvider';
import graphqlSchemaUtilsOriginal from './schemaUtils/graphqlSchemaUtils';
import introspectionUtilsOriginal from './schemaUtils/introspectionUtils';

export const openCrudDataModel = openCrudDataModelOriginal
export const openCrudSchema = openCrudSchemaOriginal
export const openCrudSchemaGraphql = openCrudSchemaGraphqlOriginal
export const getOpenCrudIntrospection = getOpenCrudIntrospectionOriginal;
export const graphqlSchemaUtils = graphqlSchemaUtilsOriginal
export const introspectionUtils = introspectionUtilsOriginal;

export default {
  openCrudDataModelOriginal,
  openCrudSchemaOriginal,
  openCrudSchemaGraphqlOriginal,
  getOpenCrudIntrospectionOriginal,
  graphqlSchemaUtilsOriginal,
  introspectionUtilsOriginal
};
