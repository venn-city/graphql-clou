const fs = require('fs');
const path = require('path');
const config = require('@venncity/nested-config')(__dirname);
const { importSchema } = require('graphql-import');
const { DefaultParser, DatabaseType } = require('prisma-datamodel');
const { makeExecutableSchema } = require('graphql-tools');
const { graphqlSync, introspectionQuery } = require('graphql');

const parser = DefaultParser.create(DatabaseType.postgres);
const dataModelPath = config.has('graphql.schema.datamodel.path')
  ? config.get('graphql.schema.datamodel.path')
  : path.join(__dirname, '../../test/datamodel.graphql');

const openCrudDataModel = parser.parseFromSchemaString(fs.readFileSync(dataModelPath, 'utf8'));

const schemaSdlPath = config.has('graphql.schema.sdl.path')
  ? config.get('graphql.schema.sdl.path')
  : path.join(__dirname, '../../test/openCRUD.graphql');
const openCrudSchemaGraphql = importSchema(schemaSdlPath);
const openCrudSchema = makeExecutableSchema({
  typeDefs: [openCrudSchemaGraphql],
  resolvers: [],
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});

let openCrudIntrospection;
function getOpenCrudIntrospection() {
  if (!openCrudIntrospection) {
    // eslint-disable-next-line no-underscore-dangle
    openCrudIntrospection = graphqlSync(openCrudSchema, introspectionQuery).data.__schema;
  }
  return openCrudIntrospection;
}

module.exports = {
  openCrudDataModel,
  openCrudSchema,
  openCrudSchemaGraphql,
  getOpenCrudIntrospection
};
