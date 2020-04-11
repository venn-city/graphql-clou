// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express');
const { sq } = require('@venncity/sequelize-model');
const { startApolloServer } = require('./index');

const models = require('./../../../../test/model');

sq.init(models);

const server = startApolloServer();
const app = express();
server.applyMiddleware({ app });

app.listen({ port: 7777 }, () => console.log(`🚀 Server ready at http://localhost:7777${server.graphqlPath}`));
