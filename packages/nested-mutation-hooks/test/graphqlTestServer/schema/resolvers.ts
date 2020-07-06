import _ from 'lodash';

const governmentResolvers = require('./resolvers/government-resolvers');
const ministerResolvers = require('./resolvers/minister-resolvers');
const ministryResolvers = require('./resolvers/ministry-resolvers');
const voteResolvers = require('./resolvers/vote-resolvers');

const resolvers = {};
_.merge(resolvers, governmentResolvers);
_.merge(resolvers, ministerResolvers);
_.merge(resolvers, ministryResolvers);
_.merge(resolvers, voteResolvers);

export default resolvers;
