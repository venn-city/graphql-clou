/* eslint-disable import/no-extraneous-dependencies */
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const { openCrudDataModel, openCrudSchemaGraphql, getOpenCrudIntrospection } = require('@venncity/opencrud-schema-provider');
const { sequelizeDataProvider: dataProvider } = require('@venncity/sequelize-data-provider');

const resolvers = require('./schema/resolvers');

const fullSchema = makeExecutableSchema({
  typeDefs: [openCrudSchemaGraphql],
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});

function startApolloServer() {
  const options = {
    schema: fullSchema,
    formatError: error => {
      console.error('Graphql query error: ', error);
      return error;
    },
    introspection: true,
    context: async req => {
      try {
        return { ...req, openCrudDataModel, openCrudIntrospection: getOpenCrudIntrospection(), resolvers, dataProvider };
      } catch (e) {
        console.error('Failed building apollo context for request.', e);
        throw e;
      }
    }
  };

  const server = new ApolloServer(options);
  return server;
}

module.exports = {
  startApolloServer
};
