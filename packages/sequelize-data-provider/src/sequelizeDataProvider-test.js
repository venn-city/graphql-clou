const { hacker } = require('faker');
const { mapKeys } = require('lodash');
const sequelizeDataProvider = require('./sequelizeDataProvider');

describe('sequelizeDataProvider', () => {
  let government;
  let ministry1;
  let ministry2;
  const governmentName = hacker.phrase();
  const ministryName1 = hacker.phrase();
  const ministryName2 = hacker.phrase();

  beforeAll(async () => {
    government = await sequelizeDataProvider.createEntity('Government', { name: governmentName });
    ministry1 = await sequelizeDataProvider.createEntity('Ministry', {
      name: ministryName1,
      government: {
        connect: {
          id: government.id
        }
      }
    });
    ministry2 = await sequelizeDataProvider.createEntity('Ministry', {
      name: ministryName2,
      government: {
        connect: {
          id: government.id
        }
      }
    });
  });

  test('getEntity', async () => {
    const fetchedGovernment = await sequelizeDataProvider.getEntity('Government', { name: governmentName });
    expect(fetchedGovernment).toMatchObject(government);
  });

  test('getAllEntities', async () => {
    const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', { where: { name: governmentName } });
    expect(fetchedGovernments).toHaveLength(1);
    expect(fetchedGovernments[0]).toMatchObject(government);
  });

  test('getEntitiesConnection', async () => {
    const fetchedGovernmentConnection = await sequelizeDataProvider.getEntitiesConnection('Government', { where: { name: governmentName } });
    expect(fetchedGovernmentConnection).toHaveProperty('aggregate', { __typename: 'AggregateGovernment', count: 1 });
  });

  test('getRelatedEntity', async () => {
    const fetchedGovernment = await sequelizeDataProvider.getRelatedEntity('Ministry', ministry1.id, 'government');
    expect(fetchedGovernment).toMatchObject(government);
  });

  test('getRelatedEntityId', async () => {
    const fetchedGovernmentId = await sequelizeDataProvider.getRelatedEntityId('Ministry', ministry1.id, 'government');
    expect(fetchedGovernmentId).toEqual(government.id);
  });

  test('getRelatedEntities', async () => {
    const fetchedMinistries = await sequelizeDataProvider.getRelatedEntities('Government', government.id, 'ministries');
    expect(
      fetchedMinistries.sort().map(m =>
        mapKeys(m, (v, k) => {
          if (k === 'ministerId') {
            return 'minister_id';
          }
          return k;
        })
      )
    ).toEqual([ministry1, ministry2].sort());
  });

  test('getRelatedEntityIds', async () => {
    const fetchedMinistryIds = await sequelizeDataProvider.getRelatedEntityIds('Government', government.id, 'ministries');
    // TODO: add test for getRelatedEntityIds(..., args)
    expect(fetchedMinistryIds.sort()).toEqual([ministry1.id, ministry2.id].sort());
  });

  test('createEntity', async () => {
    const createdGovernmentName = hacker.phrase();
    const createdGovernment = await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName });
    expect(createdGovernment).toMatchObject({
      name: createdGovernmentName,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
      deleted: null
    });
  });

  test('updateEntity', async () => {
    const createdGovernmentName = hacker.phrase();
    const updatedGovernmentName = hacker.phrase();
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName });
    const updatedGovernment = await sequelizeDataProvider.updateEntity(
      'Government',
      {
        name: updatedGovernmentName
      },
      {
        name: createdGovernmentName
      }
    );
    expect(updatedGovernment).toMatchObject({
      name: updatedGovernmentName,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
      deleted: null
    });
  });

  test('deleteEntity', async () => {
    const createdGovernmentName = hacker.phrase();
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName });
    await sequelizeDataProvider.deleteEntity('Government', { name: createdGovernmentName });
    const deletedGovernment = await sequelizeDataProvider.getEntity('Government', {
      name: createdGovernmentName
    });
    expect(deletedGovernment).toBeFalsy();
  });

  test('updateManyEntities', async () => {
    const createdGovernmentName1 = hacker.phrase();
    const createdGovernmentName2 = hacker.phrase();
    const updatedGovernmentName = hacker.phrase();
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName1 });
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName2 });
    const updatedGovernments = await sequelizeDataProvider.updateManyEntities(
      'Government',
      {
        name: updatedGovernmentName
      },
      {
        name_in: [createdGovernmentName1, createdGovernmentName2]
      }
    );
    updatedGovernments.forEach(updatedGovernment => {
      expect(updatedGovernment).toMatchObject({
        name: updatedGovernmentName,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
        deleted: null
      });
    });
  });

  test('deleteManyEntities', async () => {
    const createdGovernmentName1 = hacker.phrase();
    const createdGovernmentName2 = hacker.phrase();
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName1 });
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName2 });
    await sequelizeDataProvider.deleteManyEntities('Government', {
      name_in: [createdGovernmentName1, createdGovernmentName2]
    });
    const deletedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
      where: {
        name_in: [createdGovernmentName1, createdGovernmentName2]
      }
    });
    expect(deletedGovernments).toHaveLength(0);
  });
});
