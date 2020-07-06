import fs from 'fs';
import path from 'path';
import { importSchema } from 'graphql-import';
import { DefaultParser, DatabaseType } from 'prisma-datamodel';
import { makeExecutableSchema } from 'graphql-tools';
import { graphqlSync, introspectionQuery } from 'graphql';

const config = require('@venncity/nested-config')(__dirname);

const parser = DefaultParser.create(DatabaseType.postgres);
const dataModelPath = config.has('graphql.schema.datamodel.path')
  ? config.get('graphql.schema.datamodel.path')
  : path.join(__dirname, '../../test/datamodel.graphql');

export const openCrudDataModel = parser.parseFromSchemaString(fs.readFileSync(dataModelPath, 'utf8'));

const schemaSdlPath = config.has('graphql.schema.sdl.path')
  ? config.get('graphql.schema.sdl.path')
  : path.join(__dirname, '../../test/openCRUD.graphql');
export const openCrudSchemaGraphql = importSchema(schemaSdlPath);
export const openCrudSchema = makeExecutableSchema({
  typeDefs: [openCrudSchemaGraphql],
  resolvers: [],
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});

let openCrudIntrospection;
export function getOpenCrudIntrospection() {
  if (!openCrudIntrospection) {
    // eslint-disable-next-line no-underscore-dangle
    openCrudIntrospection = graphqlSync(openCrudSchema, introspectionQuery).data?.__schema;
  }
  return openCrudIntrospection;
}
