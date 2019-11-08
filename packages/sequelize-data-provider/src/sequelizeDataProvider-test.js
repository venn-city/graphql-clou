const { hacker } = require('faker');
const { mapKeys } = require('lodash');
const sequelizeDataProvider = require('./sequelizeDataProvider');

describe('sequelizeDataProvider', () => {
  let government;
  let ministry1;
  let ministry2;
  let governmentName = hacker.phrase();
  let ministryName1 = hacker.phrase();
  let ministryName2 = hacker.phrase();

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
    let fetchedGovernment = await sequelizeDataProvider.getEntity('Government', { name: governmentName });
    expect(fetchedGovernment).toMatchObject(government);
  });

  test('getAllEntities', async () => {
    let fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', { where: { name: governmentName } });
    expect(fetchedGovernments).toHaveLength(1);
    expect(fetchedGovernments[0]).toMatchObject(government);
  });

  test('getEntitiesConnection', async () => {
    let fetchedGovernmentConnection = await sequelizeDataProvider.getEntitiesConnection('Government', { where: { name: governmentName } });
    expect(fetchedGovernmentConnection).toHaveProperty('aggregate', { __typename: 'AggregateGovernment', count: 1 });
  });

  test('getRelatedEntity', async () => {
    let fetchedGovernment = await sequelizeDataProvider.getRelatedEntity('Ministry', ministry1.id, 'government');
    expect(fetchedGovernment).toMatchObject(government);
  });

  test('getRelatedEntityId', async () => {
    let fetchedGovernmentId = await sequelizeDataProvider.getRelatedEntityId('Ministry', ministry1.id, 'government');
    expect(fetchedGovernmentId).toEqual(government.id);
  });

  test('getRelatedEntities', async () => {
    let fetchedMinistries = await sequelizeDataProvider.getRelatedEntities('Government', government.id, 'ministries');
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
    let fetchedMinistryIds = await sequelizeDataProvider.getRelatedEntityIds('Government', government.id, 'ministries');
    expect(fetchedMinistryIds.sort()).toEqual([ministry1.id, ministry2.id].sort());
  });

  test('createEntity', async () => {
    let createdGovernmentName = hacker.phrase();
    let createdGovernment = await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName });
    expect(createdGovernment).toMatchObject({
      name: createdGovernmentName,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
      deleted: null
    });
  });

  test('updateEntity', async () => {
    let createdGovernmentName = hacker.phrase();
    let updatedGovernmentName = hacker.phrase();
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName });
    let updatedGovernment = await sequelizeDataProvider.updateEntity(
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
    let createdGovernmentName = hacker.phrase();
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName });
    await sequelizeDataProvider.deleteEntity('Government', { name: createdGovernmentName });
    let deletedGovernment = await sequelizeDataProvider.getEntity('Government', {
      name: createdGovernmentName
    });
    expect(deletedGovernment).toBeFalsy();
  });

  test('updateManyEntities', async () => {
    let createdGovernmentName1 = hacker.phrase();
    let createdGovernmentName2 = hacker.phrase();
    let updatedGovernmentName = hacker.phrase();
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName1 });
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName2 });
    let updatedGovernments = await sequelizeDataProvider.updateManyEntities(
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
    let createdGovernmentName1 = hacker.phrase();
    let createdGovernmentName2 = hacker.phrase();
    let updatedGovernmentName = hacker.phrase();
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
