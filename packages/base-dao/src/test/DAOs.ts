import createGovernmentDAO from './governmentDAO';
import createMinistryDAO from './ministryDAO';

function createAllDAOs() {
  const allDAOs = {
    governmentDAO: createGovernmentDAO(),
    ministryDAO: createMinistryDAO()
  };

  return allDAOs;
}

export default createAllDAOs;
