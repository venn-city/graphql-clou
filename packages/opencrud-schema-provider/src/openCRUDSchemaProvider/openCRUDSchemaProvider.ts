/* eslint-disable import/first */
/* eslint-disable import/no-mutable-exports */
// eslint-disable-next-line import/order
const config = require('@venncity/nested-config')(__dirname);

import fs from 'fs';
import { importSchema } from 'graphql-import';
import { DefaultParser, DatabaseType } from 'prisma-datamodel';
import { makeExecutableSchema } from 'graphql-tools';
import { graphqlSync, introspectionQuery } from 'graphql';
import * as testModels from '../test/models';

const { sdl, datamodel } = testModels;

const parser = DefaultParser.create(DatabaseType.postgres);

let openCrudDataModel;
let openCrudSchemaGraphql;

if (config.has('graphql.schema.datamodel.path')) {
  const dataModelPath = config.get('graphql.schema.datamodel.path');
  openCrudDataModel = parser.parseFromSchemaString(fs.readFileSync(dataModelPath, 'utf8'));
} else {
  openCrudDataModel = parser.parseFromSchemaString(datamodel);
}

if (config.has('graphql.schema.sdl.path')) {
  const schemaSdlPath = config.get('graphql.schema.sdl.path');
  openCrudSchemaGraphql = schemaSdlPath && importSchema(schemaSdlPath);
} else {
  openCrudSchemaGraphql = importSchema(sdl);
}

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

export { openCrudDataModel, openCrudSchemaGraphql };
