/* eslint-disable import/first */
/* eslint-disable import/no-mutable-exports */

import fs from 'fs';
import { importSchema } from 'graphql-import';
import { DefaultParser, DatabaseType } from 'prisma-datamodel';
import { makeExecutableSchema } from 'graphql-tools';
import { graphqlSync, introspectionQuery } from 'graphql';

const config = require('@venncity/nested-config')(__dirname);

const parser = DefaultParser.create(DatabaseType.postgres);
const dataModelPath = config.has('graphql.schema.datamodel.path') ? config.get('graphql.schema.datamodel.path') : null;
const schemaSdlPath = config.has('graphql.schema.sdl.path') ? config.get('graphql.schema.sdl.path') : null;

let openCrudDataModel: any;
let openCrudSchemaGraphql: any;
let openCrudSchema: any;

if (dataModelPath) {
  openCrudDataModel = parser.parseFromSchemaString(fs.readFileSync(dataModelPath, 'utf8'));
}

if (schemaSdlPath) {
  openCrudSchemaGraphql = importSchema(schemaSdlPath);
  openCrudSchema = makeExecutableSchema({
    typeDefs: [openCrudSchemaGraphql],
    resolvers: [],
    resolverValidationOptions: {
      requireResolversForResolveType: false
    }
  });
}

let openCrudIntrospection: any;
export function getOpenCrudIntrospection() {
  if (!openCrudIntrospection) {
    // eslint-disable-next-line no-underscore-dangle
    openCrudIntrospection = graphqlSync(openCrudSchema, introspectionQuery).data?.__schema;
  }
  return openCrudIntrospection;
}

export { openCrudDataModel, openCrudSchemaGraphql, openCrudSchema };
