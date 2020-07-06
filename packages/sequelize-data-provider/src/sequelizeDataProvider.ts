import { upperFirst, map, camelCase, isObject } from 'lodash';
import cuid from 'cuid';
import Sequelize from '@venncity/sequelize';
import { errors } from '@venncity/errors';
import util from 'util';
import async from 'async';
import { openCrudToSequelize } from '@venncity/graphql-transformers';
import sequelizeModel from '@venncity/sequelize-model';
import opencrudSchemaProvider from '@venncity/opencrud-schema-provider';

const {
  ClientDataValidationError,
  ServerDataValidationError,
  SUPPORTED_LOG_LEVELS: { WARN }
} = errors;

const CREATE_MANY = true;

const { getFieldType } = opencrudSchemaProvider.graphqlSchemaUtils;
const { openCrudDataModel, openCrudSchema: schema } = opencrudSchemaProvider;

const Op = Sequelize.Op;
const asyncEach = util.promisify(async.each);
const asyncMap = util.promisify(async.map);

async function getEntity(entityName: string, where: any) {
  const fetchedEntity = await model(entityName).findOne({ where });
  return fetchedEntity && fetchedEntity.dataValues;
}

async function getAllEntities(entityName: string, args?: any) {
  const fetchedEntities = await getAllEntitiesSqObjects(args, entityName);
  return map(fetchedEntities, 'dataValues');
}

async function getAllEntitiesSqObjects(args: any, entityName: string) {
  const sqFilter = args && openCrudToSequelize(args, upperFirst(entityName));
  return model(entityName).findAll(sqFilter);
}

async function getRelatedEntityId(entityName: string, originalEntityId: string, relationEntityName: string) {
  const relation = await getRelatedEntity(entityName, originalEntityId, relationEntityName);
  return relation && relation.id;
}

async function getRelatedEntity(entityName:string, originalEntityId: string, relationFieldName: string) {
  const originalEntity = await model(entityName).findOne({
    where: { id: originalEntityId },
    include: {
      model: model(getFieldType(schema, entityName, relationFieldName)),
      as: relationFieldName,
      required: true
    }
  });
  return (
    originalEntity &&
    (Array.isArray(originalEntity[relationFieldName]) && originalEntity[relationFieldName].length === 1
      ? originalEntity[relationFieldName][0].dataValues // [0] is required in cases of many-to-one mappings using a join-table.
      : originalEntity[relationFieldName].dataValues)
  );
}

async function getRelatedEntityIds(entityName: string, originalEntityId: string, relationEntityName: string, args?: any) {
  const relations = await getRelatedEntities(entityName, originalEntityId, relationEntityName, args);
  return relations && (Array.isArray(relations) ? relations.map(relation => relation.id) : relations.id);
}

async function getRelatedEntities(entityName: string, originalEntityId: string, relationFieldName: string, args?: any) {
  const relatedEntityName = getFieldType(schema, entityName, relationFieldName);
  const relatedEntityFilter = args && openCrudToSequelize(args, upperFirst(relatedEntityName));

  const originalEntity = await model(entityName).findOne({ where: { id: originalEntityId } });
  const relatedEntities = originalEntity ? await originalEntity[`get${upperFirst(relationFieldName)}`](relatedEntityFilter) : [];

  if (Array.isArray(relatedEntities)) {
    return relatedEntities.map(relatedEntity => relatedEntity.dataValues);
  }
  return relatedEntities ? relatedEntities.dataValues : [];
}

async function createEntity(entityName: string, entityToCreate: any) {
  const listRelations: any = await handleEntityRelationsPreCreate(entityName, entityToCreate);
  const createdEntity = await model(entityName).create(entityToCreate);
  await associateRelations(listRelations, createdEntity);
  return createdEntity.dataValues;
}

async function createManyEntities(entityName:string, entitiesToCreate: any) {
  entitiesToCreate.forEach(entityToCreate => {
    entityToCreate.id = cuid();
  });
  const entityIdToListRelations = {};
  await async.each(entitiesToCreate, async entityToCreate => {
    const listRelations: any = await handleEntityRelationsPreCreate(entityName, entityToCreate, CREATE_MANY);
    entityIdToListRelations[entityToCreate.id] = listRelations;
  });

  const createdEntities = await model(entityName).bulkCreate(entitiesToCreate);
  await async.eachOf(createdEntities, async createdEntity => {
    const listRelations: any = entityIdToListRelations[createdEntity.id];
    await associateRelations(listRelations, createdEntity);
  });

  return createdEntities.map(createdEntity => createdEntity.dataValues);
}

async function updateEntity(entityName: string, data: any, where: any) {
  const listRelationsToAssociate: any = [];
  const listRelationsToDisassociate: any = [];
  const entity = await model(entityName).findOne({
    where
  });
  if (!entity) {
    // TODO: throw error instead of returning null?
    return null;
  }
  await asyncEach(Object.keys(data), async entityField => {
    if (isObject(data[entityField]) && data[entityField].connect) {
      listRelationsToAssociate.push(...(await handleRelatedConnects(entityName, entityField, data)));
    }
    if (isObject(data[entityField]) && data[entityField].disconnect) {
      listRelationsToDisassociate.push(...(await handleRelatedDisconnects(entityName, entityField, data, entity)));
    }
  });
  const updatedEntity = await entity.update(data);
  await associateRelations(listRelationsToAssociate, updatedEntity);
  await disassociateRelations(listRelationsToDisassociate, updatedEntity);
  return updatedEntity.dataValues;
}

async function updateManyEntities(entityName: string, data: any, where: any) {
  const entities = await getAllEntitiesSqObjects({ where }, entityName);
  const updatedEntities = await asyncMap(entities, async entity => {
    return entity.update(data);
  });
  return map(updatedEntities, 'dataValues');
}

function isListRelation(fieldInSchema: any) {
  const relationName = openCrudDataModel.types.find(entityType => entityType.name === fieldInSchema.relationName);
  const isTableBasedRelation = relationName && relationName.directives.find(d => d.name === 'relationTable');
  return isTableBasedRelation || fieldInSchema.isList;
}

async function handleRelatedConnects(entityName: string, entityField: string, entityToCreate: any) {
  const listRelations: any = [];
  const entityTypeInSchema = openCrudDataModel.types.find(entityType => entityType.name === upperFirst(entityName));
  const fieldInSchema = entityTypeInSchema.fields.find(f => f.name === entityField);
  const pgRelationDirective = fieldInSchema.directives.find(d => d.name === 'pgRelation');
  if (pgRelationDirective && !fieldInSchema.isList) {
    const columnName = pgRelationDirective.arguments.column;
    const uniqueIdentifier = Object.keys(entityToCreate[entityField].connect)[0];
    if (uniqueIdentifier) {
      if (uniqueIdentifier === 'id') {
        entityToCreate[camelCase(columnName)] = entityToCreate[entityField].connect.id;
      } else {
        const relatedEntity = await model(fieldInSchema.type.name).findOne({
          where: { ...entityToCreate[entityField].connect }
        });
        entityToCreate[camelCase(columnName)] = relatedEntity.id;
      }
    } else {
      throw new ClientDataValidationError({
        logLevel: WARN,
        message: `Invalid argument in ${entityField} parameter`
      });
    }
  }
  if (isListRelation(fieldInSchema)) {
    const relatedEntities = await model(fieldInSchema.type.name).findAll({
      where: { [Op.or]: entityToCreate[entityField].connect }
    });
    relatedEntities.forEach(relatedEntity => {
      listRelations.push({ relatedEntityField: upperFirst(entityField), relatedEntityId: relatedEntity.id });
    });
  }
  return listRelations;
}

async function handleRelatedDisconnects(entityName: string, entityField: string, entity: any, entityInstance: any) {
  const listRelations: any = [];
  const entityTypeInSchema = openCrudDataModel.types.find(entityType => entityType.name === upperFirst(entityName));
  const fieldInSchema = entityTypeInSchema.fields.find(f => f.name === entityField);
  const pgRelationDirective = fieldInSchema.directives.find(d => d.name === 'pgRelation');
  if (pgRelationDirective && !fieldInSchema.isList) {
    const columnName = pgRelationDirective.arguments.column;
    entity[camelCase(columnName)] = null;
  }
  if (isListRelation(fieldInSchema)) {
    const disconnectArgValue = entity[entityField].disconnect;
    let relatedEntities;
    if (isObject(disconnectArgValue) || Array.isArray(disconnectArgValue)) {
      relatedEntities = await model(fieldInSchema.type.name).findAll({
        where: { [Op.or]: disconnectArgValue }
      });
    } else {
      relatedEntities = await entityInstance[`get${upperFirst(entityField)}`]();
    }
    relatedEntities.forEach(relatedEntity => {
      listRelations.push({ relatedEntityField: upperFirst(entityField), relatedEntityId: relatedEntity.id });
    });
  }
  return listRelations;
}

async function associateRelations(listRelations: any, entity: any) {
  if (listRelations.length) {
    await asyncEach(listRelations, async listRelation => {
      await entity[`add${listRelation.relatedEntityField}`](listRelation.relatedEntityId);
    });
  }
}

async function disassociateRelations(listRelations: any, entity: any) {
  if (listRelations.length) {
    await asyncEach(listRelations, async listRelation => {
      await entity[`remove${listRelation.relatedEntityField}`](listRelation.relatedEntityId);
    });
  }
}

async function deleteEntity(entityName: string, where: any) {
  const entity = await model(entityName).findOne({
    where
  });
  await entity.destroy();
  return entity.dataValues;
}

async function deleteManyEntities(entityName: string, where: any) {
  const entities = await getAllEntitiesSqObjects({ where }, entityName);
  await asyncEach(entities, async entity => {
    await entity.destroy();
  });
  return map(entities, 'dataValues');
}

async function getEntitiesConnection(entityName: string, args: any) {
  const sqFilter = args && openCrudToSequelize(args, upperFirst(entityName));
  const entityCount = await model(entityName).count(sqFilter);
  return {
    aggregate: {
      count: entityCount,
      __typename: `Aggregate${upperFirst(entityName)}`
    },
    __typename: `${upperFirst(entityName)}Connection`,
    pageInfo: {
      startCursor: null // TODO: do we need support it?
    }
  };
}

async function handleEntityRelationsPreCreate(entityName: string, entityToCreate: any, isCreateMany = false) {
  const listRelations: any = [];
  await async.each(Object.keys(entityToCreate), async entityField => {
    if (isObject(entityToCreate[entityField])) {
      if (isCreateMany && entityToCreate[entityField].create) {
        // In order to enable this need to verify that nested mutations work correctly with the bulk create scenario
        throw new ServerDataValidationError({ message: 'Nested create of entities inside of createMany is not currently supported' });
      }
      if (entityToCreate[entityField].connect) {
        listRelations.push(...(await handleRelatedConnects(entityName, entityField, entityToCreate)));
      }
    }
  });
  return listRelations;
}

function model(entityName: string) {
  return sequelizeModel.sq[entityName] || sequelizeModel.sq[upperFirst(entityName)];
}

export default {
  getEntity,
  getAllEntities,
  getRelatedEntityId,
  getRelatedEntity,
  getRelatedEntityIds,
  getRelatedEntities,
  createEntity,
  createManyEntities,
  updateEntity,
  updateManyEntities,
  deleteEntity,
  deleteManyEntities,
  getEntitiesConnection
};
