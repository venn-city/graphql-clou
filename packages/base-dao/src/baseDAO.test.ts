/* eslint-disable @typescript-eslint/no-unused-vars */
import { hacker, random } from 'faker';
import { sq } from '@venncity/sequelize-model';
import { sequelizeDataProvider } from '@venncity/sequelize-data-provider';
import { transformJoinedEntityWhere } from './baseDAO';
import { runGenericDAOTests, createServiceAuthContext, createPublicAccessAuthContext } from './test/baseTestForDAOs';
import createAllDAOs from './test/DAOs';
// @ts-ignore
import models from '../../../test/model';
import mockConfig from '../../../test/mockConfig';

sq.init(models);

mockConfig();

function buildTestObject() {
  return {
    name: hacker.phrase()
  };
}

describe('BaseDao', () => {
  afterAll(() => jest.resetAllMocks());
  describe('generic tests', () => {
    runGenericDAOTests({
      entityName: 'government',
      createAllDAOs,
      getDefaultEntityFunc: buildTestObject,
      stringFieldName: 'name'
    });

    let serviceContext: any;
    let publicAccessContext: any;
    let governmentDAO: any;
    beforeAll(async () => {
      const allDAOs = createAllDAOs();
      serviceContext = await createServiceAuthContext(allDAOs);
      publicAccessContext = createPublicAccessAuthContext(allDAOs);
      governmentDAO = createAllDAOs().governmentDAO;
    });

    test('update many with preSave', async () => {
      const createdGovernment1 = await governmentDAO.createGovernment(serviceContext, { ...buildTestObject(), country: 'DE' });
      const createdGovernment2 = await governmentDAO.createGovernment(serviceContext, { ...buildTestObject(), country: 'DE' });
      await governmentDAO.updateManyGovernments(serviceContext, { data: { name: 'preSave' }, id_in: [createdGovernment1.id, createdGovernment2.id] });
      const updatedGovernment1 = await governmentDAO.government(serviceContext, { id: createdGovernment1.id });
      const updatedGovernment2 = await governmentDAO.government(serviceContext, { id: createdGovernment2.id });

      expect(updatedGovernment1.name).toMatch('preSave_');
      expect(updatedGovernment2.name).toMatch('preSave_');
    });

    test('fetch by id_in', async () => {
      const createdGovernment = await governmentDAO.createGovernment(serviceContext, { ...buildTestObject(), country: 'DE' });
      const governmentByCountry = await governmentDAO.governments(serviceContext, { skipPagination: true, where: { id_in: [createdGovernment.id] } });
      expect(governmentByCountry[0].id).toEqual(createdGovernment.id);
      await governmentDAO.deleteManyGovernments(serviceContext, { id_in: [createdGovernment.id] });
    });
    test('fetch by id_in with pagination', async () => {
      const createdGovernment1 = await governmentDAO.createGovernment(serviceContext, { ...buildTestObject(), country: 'DE' });
      const createdGovernment2 = await governmentDAO.createGovernment(serviceContext, { ...buildTestObject(), country: 'DE' });
      const createdGovernment3 = await governmentDAO.createGovernment(serviceContext, { ...buildTestObject(), country: 'DE' });
      const governmentByCountryFirstAndSkip = await governmentDAO.governments(serviceContext, {
        where: { id_in: [createdGovernment1.id, createdGovernment2.id, createdGovernment3.id] },
        first: 1,
        skip: 2
      });
      const governmentByCountryFirst = await governmentDAO.governments(serviceContext, {
        where: { id_in: [createdGovernment1.id, createdGovernment2.id, createdGovernment3.id] },
        first: 1
      });
      expect(governmentByCountryFirstAndSkip[0].id).toEqual(createdGovernment3.id);
      expect(governmentByCountryFirst[0].id).toEqual(createdGovernment1.id);
      await governmentDAO.deleteManyGovernments(serviceContext, { id_in: [createdGovernment1.id, createdGovernment2.id, createdGovernment3.id] });
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
      const fetchedGovernmentsIds = fetchedAllGovernments.map((gov: { id: string }) => gov.id);
      expect(fetchedGovernmentsIds).toContain(firstGovernment.id);
      expect(fetchedGovernmentsIds).toContain(secondGovernment.id);
    });

    test('fetch all governments with public Access when skipAuth true', async () => {
      const firstGovernment = await governmentDAO.createGovernment(serviceContext, { ...buildTestObject(), country: 'DE' });
      const secondGovernment = await governmentDAO.createGovernment(serviceContext, { ...buildTestObject(), country: 'DE' });
      const fetchedAllGovernments = await governmentDAO.governments({ ...publicAccessContext, skipAuth: true }, { skipPagination: true });
      expect(fetchedAllGovernments.length).toBeGreaterThanOrEqual(2);
      const fetchedGovernmentsIds = fetchedAllGovernments.map((gov: { id: string }) => gov.id);
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

  describe('relatedEntities', () => {
    const randomNumber = `${random.number()}4567`;

    // @ts-ignore
    let government1: { id: any };
    const governmentName1 = `9500BC${randomNumber}`;
    const governmentCountry1 = `Atlantis${randomNumber}`;
    // @ts-ignore
    let government2: { id: any };
    const governmentName2 = `1966${randomNumber}`;
    const governmentCountry2 = `Sorcha${randomNumber}`;

    // @ts-ignore
    let ministry1: {
      name: any;
      id: any;
    };
    const ministryName1 = `Finance${randomNumber}`;
    const ministryBudget1 = 87 + randomNumber;
    // @ts-ignore
    let ministry2: {
      name: any;
      id: any;
    };
    const ministryName2 = `Defence${randomNumber}`;
    const ministryBudget2 = 22.1 + randomNumber;
    // @ts-ignore
    let ministry3: { id: any };
    const ministryName3 = `Healthcare${randomNumber}`;
    const ministryBudget3 = 22.1 + randomNumber;

    let minister1: { id: any };
    const ministerName1 = `Lazaros${randomNumber}`;
    let minister2;
    const ministerName2 = `Natassas${randomNumber}`;

    // @ts-ignore
    let minister3;
    const ministerName3 = `Vasileia${randomNumber}`;

    // @ts-ignore
    let vote1;
    const voteName1 = `Build walls${randomNumber}`;
    const voteBallot1 = 'YEA';
    // @ts-ignore
    let vote2;
    const voteName2 = `Build walls${randomNumber}`;
    const voteBallot2 = 'NAY';
    // @ts-ignore
    let vote3;
    const voteName3 = `Raise taxes${randomNumber}`;
    const voteBallot3 = 'NAY';
    // @ts-ignore
    let vote4;
    const voteName4 = `Make war${randomNumber}`;
    const voteBallot4 = 'ABSTAIN';
    let serviceContext;
    beforeAll(async () => {
      serviceContext = await createServiceAuthContext(createAllDAOs());
      console.info('random seed', randomNumber);
      government1 = await sequelizeDataProvider.createEntity('Government', { name: governmentName1, country: governmentCountry1 });
      government2 = await sequelizeDataProvider.createEntity('Government', { name: governmentName2, country: governmentCountry2 });
      minister1 = await sequelizeDataProvider.createEntity('Minister', {
        name: ministerName1
      });
      minister2 = await sequelizeDataProvider.createEntity('Minister', {
        name: ministerName2
      });
      minister3 = await sequelizeDataProvider.createEntity('Minister', {
        name: ministerName3
      });
      ministry1 = await sequelizeDataProvider.createEntity('Ministry', {
        name: ministryName1,
        budget: ministryBudget1,
        government: {
          connect: {
            id: government1.id
          }
        },
        minister: {
          connect: {
            id: minister1.id
          }
        }
      });
      ministry2 = await sequelizeDataProvider.createEntity('Ministry', {
        name: ministryName2,
        budget: ministryBudget2,
        government: {
          connect: {
            id: government1.id
          }
        },
        minister: {
          connect: {
            id: minister2.id
          }
        }
      });
      ministry3 = await sequelizeDataProvider.createEntity('Ministry', {
        name: ministryName3,
        budget: ministryBudget3,
        government: {
          connect: {
            id: government1.id
          }
        }
      });

      vote1 = await sequelizeDataProvider.createEntity('Vote', {
        name: voteName1,
        ballot: voteBallot1,
        minister: {
          connect: {
            id: minister1.id
          }
        }
      });
      vote2 = await sequelizeDataProvider.createEntity('Vote', {
        name: voteName2,
        ballot: voteBallot2,
        minister: {
          connect: {
            id: minister2.id
          }
        }
      });
      vote3 = await sequelizeDataProvider.createEntity('Vote', {
        name: voteName3,
        ballot: voteBallot3,
        minister: {
          connect: {
            id: minister2.id
          }
        }
      });
      vote4 = await sequelizeDataProvider.createEntity('Vote', {
        name: voteName4,
        ballot: voteBallot4,
        lawInfo: { a: 'b' },
        lawInfoJson: { x: 'y' }
      });
    });

    // @ts-ignore
    let governmentDAO: any;
    let ministryDAO: any;
    let ministerDAO: any;
    beforeEach(() => {
      const allDAOs = createAllDAOs();
      governmentDAO = allDAOs.governmentDAO;
      ministryDAO = allDAOs.ministryDAO;
      ministerDAO = allDAOs.ministerDAO;
    });

    test('getRelatedEntity', async () => {
      const relatedGovernment1Promise = ministryDAO.getRelatedEntity(ministry1.id, 'government', serviceContext);
      const relatedGovernment2Promise = ministryDAO.getRelatedEntity(ministry2.id, 'government', serviceContext);
      const [relatedGovernment1, relatedGovernment2] = await Promise.all([relatedGovernment1Promise, relatedGovernment2Promise]);
      expect(relatedGovernment1.id).toEqual(government1.id);
      expect(relatedGovernment2.id).toEqual(government1.id);
    });

    test('getRelatedEntityId', async () => {
      const relatedGovernment1Promise = ministryDAO.getRelatedEntityId(ministry1.id, 'government', serviceContext);
      const relatedGovernment2Promise = ministryDAO.getRelatedEntityId(ministry2.id, 'government', serviceContext);
      const relatedMinistry1Promise = ministerDAO.getRelatedEntityId(minister1.id, 'ministry', serviceContext);
      const [relatedGovernment1, relatedMinistry1, relatedGovernment2] = await Promise.all([
        relatedGovernment1Promise,
        relatedMinistry1Promise,
        relatedGovernment2Promise
      ]);
      expect(relatedGovernment1).toEqual(government1.id);
      expect(relatedGovernment2).toEqual(government1.id);
      expect(relatedMinistry1).toEqual(ministry1.id);
    });

    test('getRelatedEntities', async () => {
      const relatedMinistries1Promise = governmentDAO.getRelatedEntities(government1.id, 'ministries', serviceContext);
      const relatedMinistries2Promise = governmentDAO.getRelatedEntities(government2.id, 'ministries', serviceContext);
      const [relatedMinistries1, relatedMinistries2] = await Promise.all([relatedMinistries1Promise, relatedMinistries2Promise]);
      expect(relatedMinistries1.map((m: { id: any }) => m.id).sort()).toEqual([ministry1.id, ministry2.id, ministry3.id].sort());
      expect(relatedMinistries2).toEqual([]);
    });

    test('getRelatedEntityIds', async () => {
      const relatedMinistries0Promise = governmentDAO.getRelatedEntityIds(government1.id, 'ministries', serviceContext, {
        where: { name: 'nosuchname3432' }
      });
      const relatedMinistries1Promise = governmentDAO.getRelatedEntityIds(government1.id, 'ministries', serviceContext, {
        where: { name: ministry2.name }
      });
      const relatedMinistries2Promise = governmentDAO.getRelatedEntityIds(government1.id, 'ministries', serviceContext, {
        where: { name_not: ministry1.name }
      });
      const [relatedMinistries0, relatedMinistries1, relatedMinistries2] = await Promise.all([
        relatedMinistries0Promise,
        relatedMinistries1Promise,
        relatedMinistries2Promise
      ]);
      expect(relatedMinistries0).toEqual([]);
      expect(relatedMinistries1).toEqual([ministry2.id]);
      expect(relatedMinistries2.sort()).toEqual([ministry2.id, ministry3.id].sort());
    });
  });

  describe('batching and loading', () => {
    let serviceContext: any;
    let governmentDAO: any;
    beforeAll(async () => {
      serviceContext = await createServiceAuthContext(createAllDAOs());
      governmentDAO = createAllDAOs().governmentDAO;
    });

    test('load entity after create', async () => {
      const createdGovernment1 = await governmentDAO.createGovernment(serviceContext, { ...buildTestObject(), country: 'DE' });
      const loadedGovernment = await governmentDAO.loadEntity(createdGovernment1.id);

      expect(loadedGovernment.name).toEqual(createdGovernment1.name);
    });

    test('store entity for loading and fetch it', async () => {
      const storedId = random.uuid();
      const storedName = random.word();
      governmentDAO.storeForLoading(storedId, { id: storedId, name: storedName });
      const loadedEntity = await governmentDAO.loadEntity(storedId);

      expect(loadedEntity.name).toEqual(storedName);
    });
  });
});
