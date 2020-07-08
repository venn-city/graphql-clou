import { hacker, random } from 'faker';
import { sq } from '@venncity/sequelize-model';
import { transformJoinedEntityWhere } from './baseDAO';
import { runGenericDAOTests, createServiceAuthContext } from './test/baseTestForDAOs';
import createAllDAOs from './test/DAOs';
import models from '../../../test/model';

sq.init(models);

function buildTestObject() {
  return {
    name: hacker.phrase()
  };
}

describe('generic tests', () => {
  runGenericDAOTests({
    entityName: 'government',
    createAllDAOs,
    getDefaultEntityFunc: buildTestObject,
    stringFieldName: 'name'
  });

  let serviceContext;
  let governmentDAO;
  beforeAll(async () => {
    serviceContext = await createServiceAuthContext(createAllDAOs());
    governmentDAO = createAllDAOs().governmentDAO;
  });

  test('fetch by unique non-id field', async () => {
    await governmentDAO.createGovernment(serviceContext, { ...buildTestObject(), country: 'DE' });
    const governmentByCountry = await governmentDAO.government(serviceContext, { country: 'DE' });
    expect(governmentByCountry).toHaveProperty('country', 'DE');
    await governmentDAO.deleteGovernment(serviceContext, { country: 'DE' });
  });

  test('fetch connection', async () => {
    const governmentsConnectionResult = await governmentDAO.governmentsConnection(null, { where: { id: 'x' } }, serviceContext);
    expect(governmentsConnectionResult.aggregate).toHaveProperty('count', 0);
  });
  test('fetch all governments without pagination', async () => {
    const firstGovernment = await governmentDAO.createGovernment(serviceContext, { ...buildTestObject(), country: 'DE' });
    const secondGovernment = await governmentDAO.createGovernment(serviceContext, { ...buildTestObject(), country: 'DE' });
    const fetchedAllGovernments = await governmentDAO.governments(serviceContext, { skipPagination: true });
    expect(fetchedAllGovernments.length).toBeGreaterThanOrEqual(2);
    const fetchedGovernmentsIds = fetchedAllGovernments.map(gov => gov.id);
    expect(fetchedGovernmentsIds).toContain(firstGovernment.id);
    expect(fetchedGovernmentsIds).toContain(secondGovernment.id);
  });
  test('create government with name field even if not provided', async () => {
    const governmentCreated = await governmentDAO.createGovernment(serviceContext, { country: 'DE' });
    const governmentFetched = await governmentDAO.government(serviceContext, { id: governmentCreated.id });
    expect(governmentFetched).toHaveProperty('name', 'random_government');
  });
});
describe('transformJoinedEntityWhere', () => {
  test('Should transform the given args to fetch all entities that are connected to the given parent', () => {
    const args = { orderBy: 'createdAt_ASC' };

    const entityId = random.alphaNumeric(10);

    const expectedTransformedArgs = { ...args, where: { id_in: [entityId] }, skipPagination: true };

    const transformedArgs = transformJoinedEntityWhere(args, [entityId]);
    expect(transformedArgs).toEqual(expectedTransformedArgs);
  });
});
