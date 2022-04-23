import _ from 'lodash';

import governmentResolvers from './government/government-resolvers';
import ministerResolvers from './minister/minister-resolvers';
import ministryResolvers from './ministry/ministry-resolvers';
import voteResolvers from './vote/vote-resolvers';

const indexResolvers = {};
_.merge(indexResolvers, governmentResolvers);
_.merge(indexResolvers, ministerResolvers);
_.merge(indexResolvers, ministryResolvers);
_.merge(indexResolvers, voteResolvers);

export default indexResolvers;
