/* eslint-disable no-restricted-syntax, no-await-in-loop */
const DataLoader = require('dataloader');
const _ = require('lodash');
const util = require('util');
const async = require('async');
const pluralize = require('pluralize');
const { getQueryWhereInputName, getMutationWhereInputName } = require('@venncity/opencrud-schema-provider').introspectionUtils;
const { transformComputedFieldsWhereArguments } = require('@venncity/graphql-transformers');
const { cascadeDelete } = require('@venncity/cascade-delete');
const { sequelizeDataProvider: dataProvider } = require('@venncity/sequelize-data-provider');
const { enforcePagination } = require('@venncity/graphql-pagination-enforce');

const asyncMap = util.promisify(async.map);

const CRUD_TOPIC_OPERATION_NAMES = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED'
};

function createDAO({ entityName, hooks, pluralizationFunction = pluralize, daoAuth, publishCrudEvent }) {
  const {
    CREATE_ENTITY_FUNCTION_NAME,
    GET_ENTITIES_BY_IDS_FUNCTION_NAME,
    GET_ENTITY_BY_ID,
    GET_ENTITY,
    GET_ALL_ENTITIES_FUNCTION_NAME,
    DELETE_ENTITY_FUNCTION_NAME,
    UPDATE_ENTITY_FUNCTION_NAME,
    UPDATE_MANY_ENTITIES_FUNCTION_NAME,
    DELETE_MANY_ENTITIES_FUNCTION_NAME,
    ENTITIES_CONNECTION
  } = getFunctionNamesForEntity(entityName, pluralizationFunction);
  const {
    buildAuth,
    verifyHasPermission,
    hasPermission,
    verifyCanUpdate,
    verifyHasPermissionAndFilterUnauthorizedFields,
    supportedActions,
    filterUnauthorizedFields
  } = daoAuth;
  const { READ, CREATE, DELETE } = supportedActions;

  const authTypeName = _.upperFirst(entityName);
  const dataLoader = new DataLoader(getEntitiesByIdsInternal);
  hooks = {
    preCreate: async entity => {
      return entity;
    },
    ...hooks
  };
  const computedWhereArgumentsTransformation = hooks.computedWhereArgumentsTransformation;

  async function getEntityById(context, entityId) {
    const auth = await buildAuth(context, hooks);
    const fetchedEntity = await dataLoader.load(entityId);
    let entityWithOnlyAuthorizedFields = await verifyHasPermissionAndFilterUnauthorizedFields(context, auth, fetchedEntity, hooks, authTypeName);
    entityWithOnlyAuthorizedFields = await hooks.postFetch(entityWithOnlyAuthorizedFields);
    return entityWithOnlyAuthorizedFields;
  }

  async function getEntitiesByIdsInternal(entityIds) {
    const entities = await dataProvider.getAllEntities(entityName, { where: { id_in: entityIds } });

    // The result array must contain in each index a value corresponding to the id given in that index.
    // See https://github.com/facebook/dataloader#batch-function
    const entitiesToReturn = entityIds.map(entityId => entities.find(entity => entity.id === entityId));
    return entitiesToReturn;
  }

  function isFetchingEntityById(where) {
    const whereKeys = Object.keys(where);
    return whereKeys.length === 1 && whereKeys[0] === 'id';
  }

  return {
    computedWhereArgumentsTransformation: hooks.computedWhereArgumentsTransformation,
    transformComputedFieldsWhereArguments,
    // e.g unitById
    [GET_ENTITY_BY_ID]: async (context, where) => {
      const fetchedEntity = await getEntityById(context, where, hooks);
      return fetchedEntity;
    },
    [GET_ENTITY]: async (context, where, info = { fieldName: GET_ENTITY }) => {
      let fetchedEntity;
      if (isFetchingEntityById(where)) {
        fetchedEntity = await getEntityById(context, where.id, hooks);
        return fetchedEntity;
      }
      const whereInputName = getQueryWhereInputName(context, info.fieldName);
      const transformedWhere = await transformComputedFieldsWhereArguments({
        originalWhere: where,
        whereInputName,
        computedWhereArgumentsTransformation,
        context
      });
      const auth = await buildAuth(context, hooks);
      fetchedEntity = await dataProvider.getEntity(entityName, transformedWhere);
      let entityWithOnlyAuthorizedFields = await verifyHasPermissionAndFilterUnauthorizedFields(context, auth, fetchedEntity, hooks, authTypeName);
      entityWithOnlyAuthorizedFields = await hooks.postFetch(entityWithOnlyAuthorizedFields);
      return entityWithOnlyAuthorizedFields;
    },
    // e.g units
    [GET_ALL_ENTITIES_FUNCTION_NAME]: async (context, args = {}, info = { fieldName: GET_ALL_ENTITIES_FUNCTION_NAME }) => {
      const { skipPagination } = args;
      delete args.skipPagination;
      const auth = await buildAuth(context, hooks);
      const whereInputName = getQueryWhereInputName(context, info.fieldName);
      const transformedWhere = await transformComputedFieldsWhereArguments({
        originalWhere: args.where,
        whereInputName,
        computedWhereArgumentsTransformation,
        context
      });
      const transformedArgs = {
        ...args,
        where: transformedWhere
      };
      enforcePagination(transformedArgs, GET_ALL_ENTITIES_FUNCTION_NAME, skipPagination);

      const fetchedEntities = await dataProvider.getAllEntities(entityName, transformedArgs);
      const entitiesThatUserCanAccess = [];
      const entitiesThatUserCannotAccess = [];
      for (const fetchedEntity of fetchedEntities) {
        const authDataFromDB = await hooks.authFunctions.getAuthDataFromDB(context, fetchedEntity.id);
        if (hasPermission(auth, READ, authDataFromDB, context, authTypeName)) {
          let entityWithOnlyAuthorizedFields = filterUnauthorizedFields(auth, { $type: authTypeName, ...fetchedEntity }, READ);
          entityWithOnlyAuthorizedFields = await hooks.postFetch(entityWithOnlyAuthorizedFields);
          entitiesThatUserCanAccess.push(entityWithOnlyAuthorizedFields);
        } else {
          entitiesThatUserCannotAccess.push(fetchedEntity);
        }
      }
      logRequestsThatReturnUnauthorizedEntities(entitiesThatUserCannotAccess, context, GET_ALL_ENTITIES_FUNCTION_NAME);
      return entitiesThatUserCanAccess;
    },
    // e.g unitsByIds
    [GET_ENTITIES_BY_IDS_FUNCTION_NAME]: async (context, entityIds) => {
      const auth = await buildAuth(context, hooks);
      const entities = await dataLoader.loadMany(entityIds);
      const entitiesWithOnlyAuthorizedFields = [];
      for (const entity of entities) {
        let entityWithOnlyAuthorizedFields = await verifyHasPermissionAndFilterUnauthorizedFields(context, auth, entity, hooks, authTypeName);
        entityWithOnlyAuthorizedFields = await hooks.postFetch(entityWithOnlyAuthorizedFields);
        entitiesWithOnlyAuthorizedFields.push(entityWithOnlyAuthorizedFields);
      }
      return entitiesWithOnlyAuthorizedFields;
    },
    // e.g createUnit
    [CREATE_ENTITY_FUNCTION_NAME]: async (context, entityToCreate) => {
      const auth = await buildAuth(context, hooks);
      const entityForCreatePermissionCheck = hooks.authFunctions.transformEntityForCreate
        ? hooks.authFunctions.transformEntityForCreate(entityToCreate)
        : entityToCreate;
      verifyHasPermission(auth, CREATE, entityForCreatePermissionCheck, context, authTypeName);

      entityToCreate = await hooks.preCreate(entityToCreate);

      entityToCreate = await hooks.preSave(entityToCreate, entityToCreate, context);
      let creationResult = await dataProvider.createEntity(entityName, entityToCreate);
      creationResult = await hooks.postFetch(creationResult);

      await publishCrudEvent({
        entityName,
        operation: CRUD_TOPIC_OPERATION_NAMES.CREATED,
        entityBefore: null,
        entityAfter: creationResult,
        context
      });
      return creationResult;
    },
    // e.g updateUnit
    [UPDATE_ENTITY_FUNCTION_NAME]: async (context, { data, where }, info = { fieldName: UPDATE_ENTITY_FUNCTION_NAME }) => {
      const auth = await buildAuth(context, hooks);
      const whereInputName = getMutationWhereInputName(context, info.fieldName);
      const transformedWhere = await transformComputedFieldsWhereArguments({
        originalWhere: where,
        whereInputName,
        computedWhereArgumentsTransformation,
        context
      });
      const entitiesToUpdate = await verifyCanUpdate({
        where: transformedWhere,
        auth,
        data,
        context,
        hooks,
        authTypeName,
        dataProvider,
        entityName
      });

      data = await hooks.preSave(data, entitiesToUpdate, context);
      let updatedEntity = await dataProvider.updateEntity(entityName, data, transformedWhere);
      dataLoader.clear(updatedEntity.id);
      updatedEntity = await hooks.postFetch(updatedEntity);
      await publishCrudEvent({
        entityName,
        operation: CRUD_TOPIC_OPERATION_NAMES.UPDATED,
        entityBefore: await hooks.postFetch(entitiesToUpdate[0]),
        entityAfter: updatedEntity,
        context
      });
      return updatedEntity;
    },
    // e.g updateManyUnits
    [UPDATE_MANY_ENTITIES_FUNCTION_NAME]: async (context, { data, where }, info = { fieldName: UPDATE_MANY_ENTITIES_FUNCTION_NAME }) => {
      const auth = await buildAuth(context, hooks);
      const whereInputName = getMutationWhereInputName(context, info.fieldName);
      const transformedWhere = await transformComputedFieldsWhereArguments({
        originalWhere: where,
        whereInputName,
        computedWhereArgumentsTransformation,
        context
      });
      let entitiesToUpdate = await verifyCanUpdate({
        where: transformedWhere,
        auth,
        data,
        context,
        hooks,
        authTypeName,
        dataProvider,
        entityName
      });
      entitiesToUpdate = await asyncMap(entitiesToUpdate, hooks.postFetch);
      data = await hooks.preSave(data, entitiesToUpdate, context);
      await dataProvider.updateManyEntities(entityName, data, transformedWhere);
      const updatedEntities = await dataProvider.getAllEntities(entityName, { where: transformedWhere });

      for (const originalEntity of entitiesToUpdate) {
        dataLoader.clear(originalEntity.id);
        let updatedEntity = updatedEntities.find(entity => entity.id === originalEntity.id);
        updatedEntity = await hooks.postFetch(updatedEntity);
        await publishCrudEvent({
          entityName,
          operation: CRUD_TOPIC_OPERATION_NAMES.UPDATED,
          entityBefore: originalEntity,
          entityAfter: updatedEntity,
          context
        });
      }
      return { count: updatedEntities.length };
    },
    // e.g deleteUnit
    [DELETE_ENTITY_FUNCTION_NAME]: async (context, where, info = { fieldName: DELETE_ENTITY_FUNCTION_NAME }) => {
      const auth = await buildAuth(context, hooks);
      const whereInputName = getMutationWhereInputName(context, info.fieldName);
      const transformedWhere = await transformComputedFieldsWhereArguments({
        originalWhere: where,
        whereInputName,
        computedWhereArgumentsTransformation,
        context
      });
      const authDataFromDB = await hooks.authFunctions.getAuthDataFromDB(context, transformedWhere.id);
      verifyHasPermission(auth, DELETE, authDataFromDB, context, authTypeName);
      await hooks.preDelete(context, transformedWhere, entityName, transformedWhere.id);

      let fetchedEntity;
      if (!isFetchingEntityById(where)) {
        fetchedEntity = await dataProvider.getEntity(entityName, transformedWhere);
      }
      const entityId = transformedWhere.id || fetchedEntity.id;
      await cascadeDelete({ entityName, entityId, context });

      let deletedEntity = await dataProvider.deleteEntity(entityName, transformedWhere);
      deletedEntity = await hooks.postFetch(deletedEntity);
      if (deletedEntity) {
        dataLoader.clear(deletedEntity.id);
        await publishCrudEvent({
          entityName,
          operation: CRUD_TOPIC_OPERATION_NAMES.DELETED,
          entityBefore: deletedEntity,
          entityAfter: null,
          context
        });
      }
      return deletedEntity;
    },
    // e.g deleteManyUnits
    [DELETE_MANY_ENTITIES_FUNCTION_NAME]: async (context, where, info = { fieldName: DELETE_MANY_ENTITIES_FUNCTION_NAME }) => {
      const auth = await buildAuth(context, hooks);
      const whereInputName = getMutationWhereInputName(context, info.fieldName);
      const transformedWhere = await transformComputedFieldsWhereArguments({
        originalWhere: where,
        whereInputName,
        computedWhereArgumentsTransformation,
        context
      });
      let entitiesToDelete = await dataProvider.getAllEntities(entityName, { where: transformedWhere });

      entitiesToDelete = await asyncMap(entitiesToDelete, hooks.postFetch);
      for (const entityToDelete of entitiesToDelete) {
        await hooks.preDelete(context, { id: entityToDelete.id });
        const authDataFromDB = await hooks.authFunctions.getAuthDataFromDB(context, entityToDelete.id);
        verifyHasPermission(auth, DELETE, authDataFromDB, context, authTypeName);
        await cascadeDelete({ entityName, entityId: entityToDelete.id, context });
      }

      const deleteEntities = await dataProvider.deleteManyEntities(entityName, transformedWhere);

      for (const entityToDelete of entitiesToDelete) {
        dataLoader.clear(entityToDelete.id);
        await publishCrudEvent({
          entityName,
          operation: CRUD_TOPIC_OPERATION_NAMES.DELETED,
          entityBefore: entityToDelete,
          entityAfter: null,
          context
        });
      }
      return { count: deleteEntities.length };
    },
    [ENTITIES_CONNECTION]: async (parent, args = {}, context, info = { fieldName: ENTITIES_CONNECTION }) => {
      const whereInputName = getQueryWhereInputName(context, info.fieldName);
      const transformedWhere = await transformComputedFieldsWhereArguments({
        originalWhere: args.where,
        whereInputName,
        computedWhereArgumentsTransformation,
        context
      });
      const transformedArgs = {
        ...args,
        where: transformedWhere
      };
      return dataProvider.getEntitiesConnection(entityName, transformedArgs);
    },
    getHooks: () => {
      // need to expose for cascade delete
      return hooks;
    }
  };
}

function logRequestsThatReturnUnauthorizedEntities(entitiesThatUserCannotAccess, context, functionName) {
  if (entitiesThatUserCannotAccess.length) {
    console.warn(
      `User with id ${context.auth.id} ran ${functionName}.`,
      'His query included entities that he has no permission to see. Entities: ',
      entitiesThatUserCannotAccess
    );
  }
}

function getFunctionNamesForEntity(entityName, pluralizationFunction = pluralize) {
  const entityNameUpperFirstLetter = _.upperFirst(entityName);
  return {
    CREATE_ENTITY_FUNCTION_NAME: `create${entityNameUpperFirstLetter}`,
    GET_ENTITIES_BY_IDS_FUNCTION_NAME: `${pluralizationFunction(entityName)}ByIds`,
    GET_ENTITY_BY_ID: `${entityName}ById`,
    GET_ENTITY: `${entityName}`,
    GET_ALL_ENTITIES_FUNCTION_NAME: pluralizationFunction(entityName),
    DELETE_ENTITY_FUNCTION_NAME: `delete${entityNameUpperFirstLetter}`,
    UPDATE_ENTITY_FUNCTION_NAME: `update${entityNameUpperFirstLetter}`,
    UPDATE_MANY_ENTITIES_FUNCTION_NAME: `updateMany${pluralizationFunction(entityNameUpperFirstLetter)}`,
    DELETE_MANY_ENTITIES_FUNCTION_NAME: `deleteMany${pluralizationFunction(entityNameUpperFirstLetter)}`,
    ENTITIES_CONNECTION: `${pluralizationFunction(entityName)}Connection`
  };
}

module.exports = {
  createEntityDAO: createDAO,
  getFunctionNamesForEntity,
  CRUD_TOPIC_OPERATION_NAMES
};
