import createGovernmentDAO from './government/governmentDAO';
import createMinistryDAO from './ministry/ministryDAO';
import createMinisterDAO from './minister/ministerDAO';
import createVoteDAO from './vote/voteDAO';

function createAllDAOs() {
  const allDAOs = {
    governmentDAO: createGovernmentDAO(),
    ministryDAO: createMinistryDAO(),
    ministerDAO: createMinisterDAO(),
    voteDAO: createVoteDAO()
  };

  return allDAOs;
}

module.exports = { createAllDAOs };
