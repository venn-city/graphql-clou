import createGovernmentDAO from './governmentDAO';
import createMinistryDAO from './ministryDAO';
import createMinisterDAO from './ministerDAO';

function createAllDAOs() {
  const allDAOs = {
    governmentDAO: createGovernmentDAO(),
    ministryDAO: createMinistryDAO(),
    ministerDAO: createMinisterDAO()
  };

  return allDAOs;
}

export default createAllDAOs;
