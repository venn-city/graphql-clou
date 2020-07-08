import _ from 'lodash';

import governmentResolvers from './resolvers/government-resolvers';
import ministerResolvers from './resolvers/minister-resolvers';
import ministryResolvers from './resolvers/ministry-resolvers';
import voteResolvers from './resolvers/vote-resolvers';

const resolvers = {};
_.merge(resolvers, governmentResolvers);
_.merge(resolvers, ministerResolvers);
_.merge(resolvers, ministryResolvers);
_.merge(resolvers, voteResolvers);

export default resolvers;
