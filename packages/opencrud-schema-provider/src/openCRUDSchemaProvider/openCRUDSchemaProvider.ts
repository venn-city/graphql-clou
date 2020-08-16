/* eslint-disable import/first */
// eslint-disable-next-line import/order
const config = require('@venncity/nested-config')(__dirname);

import fs from 'fs';
import { importSchema } from 'graphql-import';
import { DefaultParser, DatabaseType } from 'prisma-datamodel';
import { makeExecutableSchema } from 'graphql-tools';
import { graphqlSync, introspectionQuery } from 'graphql';

const parser = DefaultParser.create(DatabaseType.postgres);
const dataModelPath = config.has('graphql.schema.datamodel.path') ? config.get('graphql.schema.datamodel.path') : null;

export const openCrudDataModel = dataModelPath && parser.parseFromSchemaString(fs.readFileSync(dataModelPath, 'utf8'));

const schemaSdlPath = config.has('graphql.schema.sdl.path') ? config.get('graphql.schema.sdl.path') : null;
export const openCrudSchemaGraphql = schemaSdlPath && importSchema(schemaSdlPath);
export const openCrudSchema =
  openCrudSchemaGraphql &&
  makeExecutableSchema({
    typeDefs: [openCrudSchemaGraphql],
    resolvers: [],
    resolverValidationOptions: {
      requireResolversForResolveType: false
    }
  });

let openCrudIntrospection: any;
export function getOpenCrudIntrospection() {
  if (!openCrudIntrospection) {
    // eslint-disable-next-line no-underscore-dangle
    // @ts-ignore
    openCrudIntrospection = graphqlSync(openCrudSchema, introspectionQuery).data?.__schema;
  }
  return openCrudIntrospection;
}
