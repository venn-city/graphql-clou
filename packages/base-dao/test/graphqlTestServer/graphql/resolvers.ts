import _ from 'lodash';

import governmentResolvers from './government/government-resolvers';
import ministerResolvers from './minister/minister-resolvers';
import ministryResolvers from './ministry/ministry-resolvers';
import voteResolvers from './vote/vote-resolvers';

const resolvers = {};
_.merge(resolvers, governmentResolvers);
_.merge(resolvers, ministerResolvers);
_.merge(resolvers, ministryResolvers);
_.merge(resolvers, voteResolvers);

export default resolvers;
