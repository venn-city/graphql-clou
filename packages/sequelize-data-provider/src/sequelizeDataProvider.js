const { upperFirst, map, camelCase, isObject } = require('lodash');
const Sequelize = require('sequelize');

const util = require('util');
const async = require('async');
const { openCrudToSequelize } = require('@venncity/graphql-transformers');
const { sq } = require('@venncity/sequelize-model');
const opencrudSchemaProvider = require('@venncity/opencrud-schema-provider');

const { getFieldType } = opencrudSchemaProvider.graphqlSchemaUtils;
const { openCrudDataModel, openCrudSchema: schema } = opencrudSchemaProvider;

const Op = Sequelize.Op;
const asyncEach = util.promisify(async.each);
const asyncMap = util.promisify(async.map);

async function getEntity(entityName, where) {
  const fetchedEntity = await model(entityName).findOne({ where });
  return fetchedEntity && fetchedEntity.dataValues;
}

async function getAllEntities(entityName, args) {
  const fetchedEntities = await getAllEntitiesSqObjects(args, entityName);
  return map(fetchedEntities, 'dataValues');
}

async function getAllEntitiesSqObjects(args, entityName) {
  const sqFilter = args && openCrudToSequelize(args, upperFirst(entityName), schema);
  return model(entityName).findAll(sqFilter);
}

async function getRelatedEntityId(entityName, originalEntityId, relationEntityName) {
  const relation = await getRelatedEntity(entityName, originalEntityId, relationEntityName);
  return relation && relation.id;
}

async function getRelatedEntity(entityName, originalEntityId, relationFieldName) {
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

async function getRelatedEntityIds(entityName, originalEntityId, relationEntityName, args) {
  const relations = await getRelatedEntities(entityName, originalEntityId, relationEntityName, args);
  return relations && (Array.isArray(relations) ? relations.map(relation => relation.id) : relations.id);
}

async function getRelatedEntities(entityName, originalEntityId, relationFieldName, args) {
  const fieldType = getFieldType(schema, entityName, relationFieldName);
  const associationInfo = Object.values(sq[upperFirst(entityName)].associations).find(association => association.as === relationFieldName);
  if (args && associationInfo.associationType === 'BelongsToMany') {
    // TODO: for now ignore these params as sequelize does not support them in nested nXm relations.
    // https://github.com/sequelize/sequelize/issues/4376
    delete args.first;
    delete args.skip;
  }
  const sqFilter = args && openCrudToSequelize(args, upperFirst(fieldType), schema);
  let include = {
    model: model(fieldType),
    as: relationFieldName,
    required: true
  };
  if (sqFilter) {
    include = {
      ...include,
      ...sqFilter
    };
  }
  const originalEntity = await model(entityName).findOne({
    where: { id: originalEntityId },
    include
  });
  const relatedEntities = originalEntity && originalEntity[relationFieldName];
  return (
    relatedEntities && (Array.isArray(relatedEntities) ? relatedEntities.map(relatedEntity => relatedEntity.dataValues) : relatedEntities.dataValues)
  );
}

async function createEntity(entityName, entityToCreate) {
  const listRelations = [];
  await asyncEach(Object.keys(entityToCreate), async entityField => {
    if (isObject(entityToCreate[entityField]) && entityToCreate[entityField].connect) {
      listRelations.push(...(await handleRelatedConnects(entityName, entityField, entityToCreate)));
    }
  });
  const createdEntity = await model(entityName).create(entityToCreate);
  await associateRelations(listRelations, createdEntity);
  return createdEntity.dataValues;
}

async function updateEntity(entityName, data, where) {
  const listRelationsToAssociate = [];
  const listRelationsToDisassociate = [];
  const entity = await model(entityName).findOne({
    where
  });
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

async function updateManyEntities(entityName, data, where) {
  const entities = await getAllEntitiesSqObjects({ where }, entityName);
  const updatedEntities = await asyncMap(entities, async entity => {
    return entity.update(data);
  });
  return map(updatedEntities, 'dataValues');
}

function isTableBasedRelation(fieldInSchema) {
  const relationName = openCrudDataModel.types.find(entityType => entityType.name === fieldInSchema.relationName);
  const isListRelation = relationName && relationName.directives.find(d => d.name === 'relationTable');
  return isListRelation;
}

async function handleRelatedConnects(entityName, entityField, entity) {
  const listRelations = [];
  const entityTypeInSchema = openCrudDataModel.types.find(entityType => entityType.name === upperFirst(entityName));
  const fieldInSchema = entityTypeInSchema.fields.find(f => f.name === entityField);
  const pgRelationDirective = fieldInSchema.directives.find(d => d.name === 'pgRelation');
  if (pgRelationDirective) {
    const columnName = pgRelationDirective.arguments.column;
    const uniqueIdentifier = Object.keys(entity[entityField].connect)[0];
    if (uniqueIdentifier === 'id') {
      entity[camelCase(columnName)] = entity[entityField].connect.id;
    }
    const relatedEntity = await model(fieldInSchema.type.name).findOne({
      where: { ...entity[entityField].connect }
    });
    entity[camelCase(columnName)] = relatedEntity.id;
  }
  if (isTableBasedRelation(fieldInSchema)) {
    const relatedEntities = await model(fieldInSchema.type.name).findAll({
      where: { [Op.or]: entity[entityField].connect }
    });
    relatedEntities.forEach(relatedEntity => {
      listRelations.push({ relatedEntityField: upperFirst(entityField), relatedEntityId: relatedEntity.id });
    });
  }
  return listRelations;
}

async function handleRelatedDisconnects(entityName, entityField, entity, entityInstance) {
  const listRelations = [];
  const entityTypeInSchema = openCrudDataModel.types.find(entityType => entityType.name === upperFirst(entityName));
  const fieldInSchema = entityTypeInSchema.fields.find(f => f.name === entityField);
  const pgRelationDirective = fieldInSchema.directives.find(d => d.name === 'pgRelation');
  if (pgRelationDirective) {
    const columnName = pgRelationDirective.arguments.column;
    entity[camelCase(columnName)] = null;
  }
  if (isTableBasedRelation(fieldInSchema)) {
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

async function associateRelations(listRelations, entity) {
  if (listRelations.length) {
    await asyncEach(listRelations, async listRelation => {
      await entity[`add${listRelation.relatedEntityField}`](listRelation.relatedEntityId);
    });
  }
}

async function disassociateRelations(listRelations, entity) {
  if (listRelations.length) {
    await asyncEach(listRelations, async listRelation => {
      await entity[`remove${listRelation.relatedEntityField}`](listRelation.relatedEntityId);
    });
  }
}

async function deleteEntity(entityName, where) {
  const entity = await model(entityName).findOne({
    where
  });
  await entity.destroy();
  return entity.dataValues;
}

async function deleteManyEntities(entityName, where) {
  const entities = await getAllEntitiesSqObjects({ where }, entityName);
  await asyncEach(entities, async entity => {
    await entity.destroy();
  });
  return map(entities, 'dataValues');
}

async function getEntitiesConnection(entityName, args) {
  const sqFilter = args && openCrudToSequelize(args, upperFirst(entityName), schema);
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

function model(entityName) {
  return sq[entityName] || sq[upperFirst(entityName)];
}

module.exports = {
  getEntity,
  getAllEntities,
  getRelatedEntityId,
  getRelatedEntity,
  getRelatedEntityIds,
  getRelatedEntities,
  createEntity,
  updateEntity,
  updateManyEntities,
  deleteEntity,
  deleteManyEntities,
  getEntitiesConnection
};
