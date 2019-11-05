const fs = require('fs');
const config = require('@venncity/nested-config')(__dirname);
const { importSchema } = require('graphql-import');
const { DefaultParser, DatabaseType } = require('prisma-datamodel');
const { makeExecutableSchema } = require('graphql-tools');
const { graphqlSync, introspectionQuery } = require('graphql');

const parser = DefaultParser.create(DatabaseType.postgres);
const openCrudDataModel = parser.parseFromSchemaString(fs.readFileSync(config.get('graphql.schema.datamodel.path'), 'utf8'));

const openCrudSchemaGraphql = importSchema(config.get('graphql.schema.sdl.path'));
const openCrudSchema = makeExecutableSchema({
  typeDefs: [openCrudSchemaGraphql],
  resolvers: [],
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});

function getOpenCrudIntrospection() {
  // eslint-disable-next-line no-underscore-dangle
  return graphqlSync(openCrudSchema, introspectionQuery).data.__schema;
}

module.exports = {
  openCrudDataModel,
  openCrudSchema,
  openCrudSchemaGraphql,
  getOpenCrudIntrospection
};
