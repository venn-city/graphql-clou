// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express';
import { sq } from '@venncity/sequelize-model';
import { startApolloServer } from './index';

const models = require('../../../../../test/model');

sq.init(models);

const server = startApolloServer();
const app: any = express();
server.applyMiddleware({ app });

app.listen({ port: 7777 }, () => console.log(`🚀 Server ready at http://localhost:7777${server.graphqlPath}`));
