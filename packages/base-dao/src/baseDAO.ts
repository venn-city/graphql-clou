/* eslint-disable no-restricted-syntax, no-await-in-loop */
/* eslint @typescript-eslint/no-unused-vars: ["error", { "argsIgnorePattern": "info" }] */
import DataLoader from 'dataloader';
import { isEqual, without, upperFirst, get } from 'lodash';
import hash from 'object-hash';
import { forEachOf, map as asyncMap } from 'async';
import pluralize from 'pluralize';
import openCrudSchema from '@venncity/opencrud-schema-provider';
import { transformComputedFieldsWhereArguments } from '@venncity/graphql-transformers';
import { cascadeDelete } from '@venncity/cascade-delete';
import {
  sequelizeDataProvider as dataProvider,
  loadSingleRelatedEntities,
  loadRelatedEntities,
  GetRelatedEntitiesArgs,
  GetRelatedEntityArgs
} from '@venncity/sequelize-data-provider';
import { enforcePagination } from '@venncity/graphql-pagination-enforce';

const { getQueryWhereInputName, getMutationWhereInputName } = openCrudSchema.introspectionUtils;

export const CRUD_TOPIC_OPERATION_NAMES = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED'
};

export function createEntityDAO({ entityName, hooks, pluralizationFunction = pluralize, daoAuth, publishCrudEvent }) {
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

  const authTypeName = upperFirst(entityName);
  const dataLoaderById = new DataLoader(getEntitiesByIdsInternal);
  const dataLoaderForSingleRelatedEntity: DataLoader<GetRelatedEntityArgs, any> = new DataLoader(
    keys => loadSingleRelatedEntities(entityName, keys),
    {
      cacheKeyFn: key => hash(key)
    }
  );
  const dataLoaderForRelatedEntities = new DataLoader<GetRelatedEntitiesArgs, any>(
    keys => loadRelatedEntities(entityName, keys, dataProvider.getRelatedEntities),
    {
      cacheKeyFn: key => hash(key)
    }
  );
  hooks = {
    preCreate: async entity => {
      return entity;
    },
    ...hooks
  };
  const computedWhereArgumentsTransformation = hooks.computedWhereArgumentsTransformation;

  async function getEntityById(context, entityId) {
    const auth = await buildAuth(context, hooks);
    const fetchedEntity = await dataLoaderById.load(entityId);
    let entityWithOnlyAuthorizedFields = await verifyHasPermissionAndFilterUnauthorizedFields(context, auth, fetchedEntity, hooks, authTypeName);
    entityWithOnlyAuthorizedFields = await hooks.postFetch(entityWithOnlyAuthorizedFields, context);
    return entityWithOnlyAuthorizedFields;
  }

  async function getAllEntitiesInternal(args) {
    const fetchIsExactlyByIdIn = Object.keys(args).length === 1 && args.where && Object.keys(args.where).length === 1 && args.where.id_in;
    if (fetchIsExactlyByIdIn) {
      const loadedEntities = await dataLoaderById.loadMany(args.where.id_in);
      return without(loadedEntities, undefined);
    }
    return dataProvider.getAllEntities(entityName, args);
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

  function clearLoaders(entityToDelete) {
    dataLoaderById.clear(entityToDelete.id);
    dataLoaderForSingleRelatedEntity.clearAll();
    dataLoaderForRelatedEntities.clearAll();
  }

  return {
    computedWhereArgumentsTransformation: hooks.computedWhereArgumentsTransformation,
    transformComputedFieldsWhereArguments,
    // e.g unitById
    [GET_ENTITY_BY_ID]: async (context, where) => {
      const fetchedEntity = await getEntityById(context, where);
      return fetchedEntity;
    },
    [GET_ENTITY]: async (context, where, info) => {
      let fetchedEntity;
      if (isFetchingEntityById(where)) {
        fetchedEntity = await getEntityById(context, where.id);
        return fetchedEntity;
      }
      const whereInputName = getQueryWhereInputName(context, GET_ENTITY);
      const transformedWhere = await transformComputedFieldsWhereArguments({
        originalWhere: where,
        whereInputName,
        computedWhereArgumentsTransformation,
        context
      });
      const auth = await buildAuth(context, hooks);
      fetchedEntity = await dataProvider.getEntity(entityName, transformedWhere);
      let entityWithOnlyAuthorizedFields = await verifyHasPermissionAndFilterUnauthorizedFields(context, auth, fetchedEntity, hooks, authTypeName);
      entityWithOnlyAuthorizedFields = await hooks.postFetch(entityWithOnlyAuthorizedFields, context);
      return entityWithOnlyAuthorizedFields;
    },
    // e.g units
    [GET_ALL_ENTITIES_FUNCTION_NAME]: async (context, args = { where: undefined, skipPagination: undefined }, info) => {
      const { skipPagination } = args;
      delete args.skipPagination;
      const auth = await buildAuth(context, hooks);
      const whereInputName = getQueryWhereInputName(context, GET_ALL_ENTITIES_FUNCTION_NAME);
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

      const fetchedEntities = await getAllEntitiesInternal(transformedArgs);
      const entitiesThatUserCanAccess: any = [];
      const entitiesThatUserCannotAccess: any = [];
      for (const fetchedEntity of fetchedEntities) {
        const authDataFromDB = await hooks.authFunctions.getAuthDataFromDB(context, fetchedEntity.id);
        if (hasPermission(auth, READ, authDataFromDB, context, authTypeName)) {
          let entityWithOnlyAuthorizedFields = filterUnauthorizedFields(auth, { $type: authTypeName, ...fetchedEntity }, READ);
          entityWithOnlyAuthorizedFields = await hooks.postFetch(entityWithOnlyAuthorizedFields, context);
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
      const entities = await dataLoaderById.loadMany(entityIds);
      const entitiesWithOnlyAuthorizedFields: any = [];
      for (const entity of entities) {
        let entityWithOnlyAuthorizedFields = await verifyHasPermissionAndFilterUnauthorizedFields(context, auth, entity, hooks, authTypeName);
        entityWithOnlyAuthorizedFields = await hooks.postFetch(entityWithOnlyAuthorizedFields, context);
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
      if (hooks.postCreate) {
        creationResult = await hooks.postCreate(entityToCreate, creationResult);
      }
      creationResult = await hooks.postFetch(creationResult, context);

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
    [UPDATE_ENTITY_FUNCTION_NAME]: async (context, { data, where }, info) => {
      const auth = await buildAuth(context, hooks);
      const whereInputName = getMutationWhereInputName(context, UPDATE_ENTITY_FUNCTION_NAME);
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
      const entityToUpdate = get(entitiesToUpdate, '[0]');
      data = await hooks.preSave(data, entityToUpdate, context);
      let updatedEntity = await dataProvider.updateEntity(entityName, data, transformedWhere);
      if (updatedEntity) {
        clearLoaders(updatedEntity);
        updatedEntity = await hooks.postFetch(updatedEntity, context);
        await publishCrudEvent({
          entityName,
          operation: CRUD_TOPIC_OPERATION_NAMES.UPDATED,
          entityBefore: await hooks.postFetch(entitiesToUpdate[0], context),
          entityAfter: updatedEntity,
          context
        });
      }
      return updatedEntity;
    },
    // e.g updateManyUnits
    [UPDATE_MANY_ENTITIES_FUNCTION_NAME]: async (context, { data, where }, info) => {
      const auth = await buildAuth(context, hooks);
      const whereInputName = getMutationWhereInputName(context, UPDATE_MANY_ENTITIES_FUNCTION_NAME);
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
      data = await asyncMap(entitiesToUpdate, async entityToUpdate => hooks.preSave(data, entityToUpdate, context));
      if (allDataEqual(data)) {
        await dataProvider.updateManyEntities(entityName, data[0], transformedWhere);
      } else {
        await forEachOf(entitiesToUpdate, async (entity, index) => {
          // @ts-ignore
          await dataProvider.updateEntity(entityName, data[index], { id: entity.id });
        });
      }
      const updatedEntities = await getAllEntitiesInternal({ where: transformedWhere });

      for (const originalEntity of entitiesToUpdate) {
        clearLoaders(originalEntity);
        let updatedEntity = updatedEntities.find(entity => entity.id === originalEntity.id);
        updatedEntity = await hooks.postFetch(updatedEntity, context);
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
    [DELETE_ENTITY_FUNCTION_NAME]: async (context, where, info) => {
      const auth = await buildAuth(context, hooks);
      const whereInputName = getMutationWhereInputName(context, DELETE_ENTITY_FUNCTION_NAME);
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
      deletedEntity = await hooks.postFetch(deletedEntity, context);
      if (deletedEntity) {
        clearLoaders(deletedEntity);
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
    [DELETE_MANY_ENTITIES_FUNCTION_NAME]: async (context, where, info) => {
      const auth = await buildAuth(context, hooks);
      const whereInputName = getMutationWhereInputName(context, DELETE_MANY_ENTITIES_FUNCTION_NAME);
      const transformedWhere = await transformComputedFieldsWhereArguments({
        originalWhere: where,
        whereInputName,
        computedWhereArgumentsTransformation,
        context
      });
      let entitiesToDelete = await getAllEntitiesInternal({ where: transformedWhere });

      entitiesToDelete = await asyncMap(entitiesToDelete, hooks.postFetch);
      for (const entityToDelete of entitiesToDelete) {
        await hooks.preDelete(context, { id: entityToDelete.id });
        const authDataFromDB = await hooks.authFunctions.getAuthDataFromDB(context, entityToDelete.id);
        verifyHasPermission(auth, DELETE, authDataFromDB, context, authTypeName);
        await cascadeDelete({ entityName, entityId: entityToDelete.id, context });
      }

      const deleteEntities = await dataProvider.deleteManyEntities(entityName, transformedWhere);

      for (const entityToDelete of entitiesToDelete) {
        clearLoaders(entityToDelete);
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
    [ENTITIES_CONNECTION]: async (parent, args = { where: undefined }, context, info) => {
      const whereInputName = getQueryWhereInputName(context, ENTITIES_CONNECTION);
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
    getRelatedEntityId: async (originalEntityId: string, relationEntityName: string): Promise<string | null> => {
      const relation = await dataLoaderForSingleRelatedEntity.load({ originalEntityId, relationEntityName });
      return relation && relation.id;
    },
    getRelatedEntity: async <T>(originalEntityId: string, relationEntityName: string): Promise<T | null> => {
      return dataLoaderForSingleRelatedEntity.load({ originalEntityId, relationEntityName });
    },
    getRelatedEntityIds: async (originalEntityId: string, relationEntityName: string, args?: any): Promise<string[]> => {
      const relations = await dataLoaderForRelatedEntities.load({ originalEntityId, relationEntityName, args });
      if (!relations) {
        return [];
      }
      return Array.isArray(relations) ? without(relations, undefined).map(relation => relation.id) : [relations.id];
    },
    getRelatedEntities: async <T>(originalEntityId: string, relationEntityName: string, args?: any): Promise<T[]> => {
      const relatedEntities = await dataLoaderForRelatedEntities.load({ originalEntityId, relationEntityName, args });
      return (without(relatedEntities, undefined) as unknown) as T[];
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

function allDataEqual(dataArray) {
  return dataArray.every(data => isEqual(dataArray[0], data));
}

export function getFunctionNamesForEntity(entityName, pluralizationFunction = pluralize) {
  const entityNameUpperFirstLetter = upperFirst(entityName);
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

export function transformJoinedEntityWhere(args, entityIds) {
  return {
    ...args,
    where: {
      id_in: entityIds
    },
    skipPagination: true
  };
}

export default {
  createEntityDAO,
  getFunctionNamesForEntity,
  transformJoinedEntityWhere,
  CRUD_TOPIC_OPERATION_NAMES
};
