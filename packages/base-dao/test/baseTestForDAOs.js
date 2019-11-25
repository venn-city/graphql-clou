const pluralize = require('pluralize'); // eslint-disable-line import/no-extraneous-dependencies
const momentRandom = require('moment-random'); // eslint-disable-line import/no-extraneous-dependencies
const _ = require('lodash');
const { getFunctionNamesForEntity } = require('./../src/baseDAO');
const { getOpenCrudIntrospection, openCrudDataModel } = require('@venncity/opencrud-schema-provider');

const BASE_DAO_TEST_TYPES = {
  CREATE: 'CREATE',
  DELETE_ONE: 'DELETE_ONE',
  DELETE_MANY: 'DELETE_MANY',
  GET_ALL: 'GET_ALL',
  GET_ONE_BY_ID: 'GET_ONE_BY_ID',
  GET_ONE_BY_QUERY: 'GET_ONE_BY_QUERY',
  GET_MANY_BY_IDS: 'GET_MANY_BY_IDS',
  GET_MANY_BY_QUERY: 'GET_MANY_BY_QUERY',
  UPDATE_ONE: 'UPDATE_ONE',
  UPDATE_MANY: 'UPDATE_MANY'
};
/**
 * This will run tests on all the functions that baseDAO provides.
 * This should be called from the test file of every DAO that is created.
 * @param entityName            Name of the entity being tested (e.g unit)
 * @param getDefaultEntityFunc  A function that returns an entity that will be created during the test (need to able to repeadly create this
 *                              entity so if there are unique fields, create a random value for them)
 * @param context
 * @param pluralizationFunction
 * @param fieldName       Name of some string field on the entity that will be used for testing (e.g airtableId)
 * @param dataType
 * @param expectWithEquality
 */
function runGenericDAOTests({
                              entityName,
                              createAllDAOs,
                              createAdminAuthContext = createServiceAuthContext,
                              getDefaultEntityFunc,
                              pluralizationFunction = pluralize,
                              stringFieldName: fieldName,
                              dataType = 'string',
                              testsToSkip = [],
                              expectEqual = (expectedEntity, actualEntity, value) => {
                                expect(expectedEntity).toHaveProperty(fieldName, value);
                              }
                            }) {
  const DAOName = `${entityName}DAO`;
  const entityNamePlural = pluralizationFunction(entityName);

  const {
    CREATE_ENTITY_FUNCTION_NAME,
    GET_ENTITIES_BY_IDS_FUNCTION_NAME,
    GET_ENTITY_BY_ID,
    GET_ENTITY,
    GET_ALL_ENTITIES_FUNCTION_NAME,
    DELETE_ENTITY_FUNCTION_NAME,
    UPDATE_ENTITY_FUNCTION_NAME,
    UPDATE_MANY_ENTITIES_FUNCTION_NAME,
    DELETE_MANY_ENTITIES_FUNCTION_NAME
  } = getFunctionNamesForEntity(entityName, pluralizationFunction);

  describe('generic DAO tests', () => {
    let entityDAO;
    let adminContext;
    const DAOs = createAllDAOs();

    beforeAll(async () => {
      adminContext = await createAdminAuthContext(DAOs);
      adminContext.DAOs = DAOs;
    });

    beforeEach(() => {
      entityDAO = DAOs[DAOName];
    });

    describe('basic crud - as admin user', () => {
      if (!testsToSkip.includes(BASE_DAO_TEST_TYPES.CREATE)) {
        test(`Create ${entityName}`, async () => {
          const entityToCreate = await getDefaultEntityFunc();
          let createdEntity = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate);

          createdEntity = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity.id);

          expect(createdEntity).toMatchObject({
            id: expect.any(String)
          });
        });
      }
      if (!testsToSkip.includes(BASE_DAO_TEST_TYPES.GET_ALL)) {
        test(`Get all ${entityNamePlural}`, async () => {
          const entityToCreate = await getDefaultEntityFunc();
          let createdEntity = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate);
          const allEntities = await getAllEntitiesWithPagination(entityDAO, GET_ALL_ENTITIES_FUNCTION_NAME, adminContext);

          createdEntity = allEntities.find(entity => entity.id === createdEntity.id);
          expect(createdEntity).toBeTruthy();
        });
      }

      if (!testsToSkip.includes(BASE_DAO_TEST_TYPES.GET_ONE_BY_ID)) {
        test(`Get ${entityName} by id`, async () => {
          const entityToCreate = await getDefaultEntityFunc();
          const createdEntity = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate);
          const entity = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity.id);
          expect(entity).toHaveProperty('id', createdEntity.id);
        });
      }
      if (!testsToSkip.includes(BASE_DAO_TEST_TYPES.GET_MANY_BY_IDS)) {
        test(`Get ${entityNamePlural} by ids`, async () => {
          const entityToCreate1 = await getDefaultEntityFunc();
          const entityToCreate2 = await getDefaultEntityFunc();
          const entity1 = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate1);
          const entity2 = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate2);

          const entities = await entityDAO[GET_ENTITIES_BY_IDS_FUNCTION_NAME](adminContext, [entity1.id, entity2.id]);

          expect(entities[0]).toHaveProperty('id', entity1.id);
          expect(entities[1]).toHaveProperty('id', entity2.id);
        });
      }
      if (!testsToSkip.includes(BASE_DAO_TEST_TYPES.GET_ONE_BY_QUERY)) {
        test(`Get ${entityName} by query`, async () => {
          let entityFromGetQuery = await entityDAO[GET_ENTITY](adminContext, { id: 'ID_THAT_DOES_NOT_EXIST' });
          expect(entityFromGetQuery).toBeFalsy();

          const entityToCreate = await getDefaultEntityFunc();
          const createdEntity = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate);

          entityFromGetQuery = await entityDAO[GET_ENTITY](adminContext, { id: createdEntity.id });

          expect(entityFromGetQuery).toBeTruthy();
          expect(entityFromGetQuery).toHaveProperty('id', createdEntity.id);
        });
      }
      if (!testsToSkip.includes(BASE_DAO_TEST_TYPES.GET_MANY_BY_QUERY)) {
        test(`Get ${entityNamePlural} by query`, async () => {
          const stringFieldValue = randomValuesByType(dataType)[0];
          const entityToCreate1 = await getDefaultEntityFunc();
          entityToCreate1[fieldName] = stringFieldValue;
          const entityToCreate2 = await getDefaultEntityFunc();
          entityToCreate2[fieldName] = stringFieldValue;

          const createdEntity1 = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate1);

          let queryArgs = {
            where: { [fieldName]: entityToCreate1[fieldName] }
          };
          let entitiesThatMatchQuery = await getAllEntitiesWithPagination(entityDAO, GET_ALL_ENTITIES_FUNCTION_NAME, adminContext, queryArgs);

          const entityFoundByQuery1 = _.find(entitiesThatMatchQuery, entity => entity.id === createdEntity1.id);
          expectEqual(entityFoundByQuery1, fieldName, entityToCreate1[fieldName]);

          const createdEntity2 = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate2);

          queryArgs = {
            where: { [fieldName]: entityToCreate2[fieldName] }
          };
          entitiesThatMatchQuery = await getAllEntitiesWithPagination(entityDAO, GET_ALL_ENTITIES_FUNCTION_NAME, adminContext, queryArgs);

          const entityFoundByQuery2 = _.find(entitiesThatMatchQuery, entity => entity.id === createdEntity2.id);
          expectEqual(entityFoundByQuery2, fieldName, entityToCreate1[fieldName]);
        });
      }
      if (!testsToSkip.includes(BASE_DAO_TEST_TYPES.UPDATE_ONE)) {
        test(`Update ${entityName}`, async () => {
          const stringFieldValue = randomValuesByType(dataType)[0];
          const entityToCreate = await getDefaultEntityFunc();
          entityToCreate[fieldName] = stringFieldValue;
          const createdEntity = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate);

          let entity = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity.id);
          expectEqual(entity, fieldName, entityToCreate[fieldName]);

          const updatedStringFieldValue = randomValuesByType(dataType)[1];
          await entityDAO[UPDATE_ENTITY_FUNCTION_NAME](adminContext, {
            data: {
              [fieldName]: updatedStringFieldValue
            },
            where: {
              id: createdEntity.id
            }
          });

          entity = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity.id);
          expectEqual(entity, fieldName, updatedStringFieldValue);
        });
      }
      if (!testsToSkip.includes(BASE_DAO_TEST_TYPES.UPDATE_MANY)) {
        test(`Update many ${entityNamePlural}`, async () => {
          const entityToCreate1 = await getDefaultEntityFunc();
          entityToCreate1[fieldName] = randomValuesByType(dataType)[0];
          const entityToCreate2 = await getDefaultEntityFunc();
          entityToCreate2[fieldName] = randomValuesByType(dataType)[1];

          let createdEntity1 = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate1);
          let createdEntity2 = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate2);

          // Fetching entities here to test that cache clearing after update works correctly
          createdEntity1 = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity1.id);
          createdEntity2 = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity2.id);

          const updatedFieldValue = randomValuesByType(dataType)[1];
          await entityDAO[UPDATE_MANY_ENTITIES_FUNCTION_NAME](adminContext, {
            data: {
              [fieldName]: updatedFieldValue
            },
            where: {
              id_in: [createdEntity1.id, createdEntity2.id]
            }
          });

          createdEntity1 = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity1.id);
          createdEntity2 = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity2.id);

          expectEqual(createdEntity1, fieldName, updatedFieldValue);
          expectEqual(createdEntity2, fieldName, updatedFieldValue);
        });
      }
      if (!testsToSkip.includes(BASE_DAO_TEST_TYPES.DELETE_ONE)) {
        test(`Delete ${entityName}`, async () => {
          const entityToCreate = await getDefaultEntityFunc();
          const createdEntity = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate);

          let entity = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity.id);
          expect(entity).toBeTruthy();

          await entityDAO[DELETE_ENTITY_FUNCTION_NAME](adminContext, { id: entity.id });

          entity = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity.id);
          expect(entity).toBeFalsy();
        });
      }
      if (!testsToSkip.includes(BASE_DAO_TEST_TYPES.DELETE_MANY)) {
        test(`Delete many ${entityNamePlural}`, async () => {
          const entityToCreate1 = await getDefaultEntityFunc();
          const entityToCreate2 = await getDefaultEntityFunc();
          let createdEntity1 = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate1);
          let createdEntity2 = await entityDAO[CREATE_ENTITY_FUNCTION_NAME](adminContext, entityToCreate2);

          // Fetching entities here to test that cache clearing after update works correctly
          createdEntity1 = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity1.id);
          createdEntity2 = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity2.id);

          await entityDAO[DELETE_MANY_ENTITIES_FUNCTION_NAME](adminContext, { id_in: [createdEntity1.id, createdEntity2.id] });

          const entity1 = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity1.id);
          const entity2 = await entityDAO[GET_ENTITY_BY_ID](adminContext, createdEntity2.id);
          expect(entity1).toBeFalsy();
          expect(entity2).toBeFalsy();
        });
      }
    });
  });
}

function randomValuesByType(dataType) {
  if (_.isArray(dataType)) {
    // Hardcoded values, e.g. enum.
    return [dataType[0], dataType[1]];
  }
  const timeZoneSuffix = 'T00:00:00.000Z';
  switch (dataType) {
    case 'date':
      return [`${momentRandom().format('YYYY-MM-DD')}${timeZoneSuffix}`, `${momentRandom().format('YYYY-MM-DD')}${timeZoneSuffix}`];
    case 'dateonly':
      return [`${momentRandom().format('YYYY-MM-DD')}${timeZoneSuffix}`, `${momentRandom().format('YYYY-MM-DD')}${timeZoneSuffix}`];
    case 'string':
      return [Math.random().toString(), Math.random().toString()];
    case 'int':
      return [Math.floor(Math.random() * 100000), Math.floor(Math.random() * 100000)];
    default:
      return [Math.random(), Math.random()];
  }
}

async function createServiceAuthContext(DAOs) {
  return {
    auth: {
      isService: true
    },
    openCrudIntrospection: getOpenCrudIntrospection(),
    openCrudDataModel,
    DAOs
  };
}

const GRAPHQL_SERVER_MAX_PAGE_SIZE = 50;

async function getAllEntitiesWithPagination(entityDao, queryName, context, queryArgs = {}) {
  let fetchedEntities = [];
  let fetchedEntitiesChunk;
  const whereArgs = { first: GRAPHQL_SERVER_MAX_PAGE_SIZE, skip: 0, ...queryArgs };

  do {
    // eslint-disable-next-line no-await-in-loop
    fetchedEntitiesChunk = await entityDao[queryName](context, whereArgs);
    fetchedEntities = fetchedEntities.concat(fetchedEntitiesChunk);
    whereArgs.skip += GRAPHQL_SERVER_MAX_PAGE_SIZE;
  } while (fetchedEntitiesChunk.length);

  return fetchedEntities;
}

module.exports = { runGenericDAOTests, BASE_DAO_TEST_TYPES, createServiceAuthContext };
