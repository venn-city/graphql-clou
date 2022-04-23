/* eslint-disable import/no-extraneous-dependencies */
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { getOpenCrudIntrospection, openCrudDataModel, openCrudSchemaGraphql } from '@venncity/opencrud-schema-provider';
import { sequelizeDataProvider as dataProvider } from '@venncity/sequelize-data-provider';

import indexResolvers from './index-resolvers';
// @ts-ignore
import { createAllDAOs } from './DAOs';

const fullSchema = makeExecutableSchema({
  typeDefs: [openCrudSchemaGraphql],
  resolvers: indexResolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});

// eslint-disable-next-line import/prefer-default-export
export function startApolloServer() {
  const options = {
    schema: fullSchema,
    formatError: error => {
      console.error('Graphql query error: ', error);
      return error;
    },
    introspection: true,
    context: async req => {
      try {
        const DAOs = createAllDAOs();
        return {
          ...req,
          openCrudDataModel,
          openCrudIntrospection: getOpenCrudIntrospection(),
          resolvers: indexResolvers,
          dataProvider,
          DAOs
        };
      } catch (e) {
        console.error('Failed building apollo context for request.', e);
        throw e;
      }
    }
  };

  return new ApolloServer(options);
}
