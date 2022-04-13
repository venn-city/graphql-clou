import createGovernmentDAO from './governmentDAO';
import createMinistryDAO from './ministryDAO';
import createMinisterDAO from './ministerDAO';
import createVoteDAO from './voteDAO';

function createAllDAOs() {
  const allDAOs = {
    governmentDAO: createGovernmentDAO(),
    ministryDAO: createMinistryDAO(),
    ministerDAO: createMinisterDAO(),
    voteDAO: createVoteDAO()
  };

  return allDAOs;
}

export default createAllDAOs;
