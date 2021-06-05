import { partition, uniq, upperFirst, isEmpty, isObject, groupBy } from 'lodash';
import async, { Dictionary } from 'async';
import sequelizeModel from '@venncity/sequelize-model';
import opencrudSchemaProvider from '@venncity/opencrud-schema-provider';
import { openCrudToSequelize } from '@venncity/graphql-transformers';
import Sequelize from '@venncity/sequelize';
import { extractManyResult, extractSingleResult } from './resultExtractionHelper';

const { getFieldType } = opencrudSchemaProvider.graphqlSchemaUtils;
const { openCrudSchema: schema } = opencrudSchemaProvider;

export async function loadSingleRelatedEntities(entityName: string, keys: readonly GetRelatedEntityArgs[]) {
  const originalEntities = await fetchEntitiesWithRelations(keys, entityName);
  return keys.map(k => extractSingleResult(originalEntities.find(o => o.dataValues.id === k.originalEntityId)?.dataValues, k.relationEntityName));
}

export async function loadRelatedEntities(entityName: string, keys: readonly GetRelatedEntitiesArgs[]) {
  const [keysWithoutArgs, keysWithArgs] = partition(keys, key => {
    const args = key.args;
    if (isObject(args)) {
      // @ts-ignore
      const { skipPagination, ...newArg } = args;
      return isEmpty(newArg);
    }
    return true;
  });

  const originalEntitiesWithoutArgs = await fetchEntitiesWithRelations(keysWithoutArgs, entityName);

  const keysGroupedByRelationAndArgs = groupBy(keysWithArgs, key => relationAndArgsKey(key));
  const originalEntitiesWithArgs = await fetchEntitiesWithArgsByGroup(keysGroupedByRelationAndArgs, entityName);

  return mapResultsToKeys(keys, originalEntitiesWithArgs, originalEntitiesWithoutArgs);
}

async function fetchEntitiesWithRelationsAndArgs(
  relationEntitiesArgs: { relationEntityName; args },
  entityName: string,
  groupOriginalEntityIds: string[]
) {
  const { relationEntityName, args } = relationEntitiesArgs;
  const fieldType = getFieldType(schema, entityName, relationEntityName);
  const entityFilter = args && openCrudToSequelize(args, fieldType);

  const include = {
    model: model(fieldType),
    as: relationEntityName,
    required: false,
    // @ts-ignore
    where: entityFilter?.where
  };

  // @ts-ignore
  return model(entityName).findAll({
    where: { id: { [Sequelize.Op.in]: groupOriginalEntityIds } },
    include
  });
}

async function fetchEntitiesWithArgsByGroup(keysGroupedByRelationAndArgs: Dictionary<any[]>, entityName: string) {
  const originalEntitiesWithArgs: { key; relatedEntitiesWithArgs: any[] }[] = await async.map(
    Object.keys(keysGroupedByRelationAndArgs),
    async keyWithArgsJson => {
      const groupOriginalEntityIds = keysGroupedByRelationAndArgs[keyWithArgsJson].map(v => v.originalEntityId);
      const keyWithArgs = JSON.parse(keyWithArgsJson);
      return {
        results: await fetchEntitiesWithRelationsAndArgs(keyWithArgs, entityName, groupOriginalEntityIds),
        keyWithArgsJson
      };
    }
  );
  return originalEntitiesWithArgs;
}

async function fetchEntitiesWithRelations(keys: readonly GetRelatedEntityArgs[], entityName: string) {
  const includes = keys.map(k => ({
    model: model(getFieldType(schema, entityName, k.relationEntityName)),
    as: k.relationEntityName,
    required: false
  }));

  return model(entityName).findAll({
    where: { id: keys.map(k => k.originalEntityId) },
    include: uniq(includes)
  });
}

function mapResultsToKeys(keys, originalEntitiesWithArgs, originalEntitiesWithoutArgs) {
  return keys.map(k => {
    const originalEntityResultsMatchedByRelationAndArgs = originalEntitiesWithArgs.find(
      originalEntity => originalEntity.keyWithArgsJson === relationAndArgsKey(k)
    );
    if (originalEntityResultsMatchedByRelationAndArgs) {
      const originalEntityMatchedById = originalEntityResultsMatchedByRelationAndArgs.results.find(
        originalEntity => originalEntity.dataValues.id === k.originalEntityId
      );
      const relatedEntities = originalEntityMatchedById[k.relationEntityName];
      return extractManyResult(relatedEntities);
    }
    const originalEntityWithoutArgs = originalEntitiesWithoutArgs.find(originalEntity => originalEntity.dataValues.id === k.originalEntityId);
    if (originalEntityWithoutArgs) {
      const relatedEntities = originalEntityWithoutArgs[k.relationEntityName];
      return extractManyResult(relatedEntities);
    }
    return undefined;
  });
}

function relationAndArgsKey(key) {
  return JSON.stringify({
    relationEntityName: key.relationEntityName,
    args: key.args
  });
}

function model(entityName: string) {
  return sequelizeModel.sq[entityName] || sequelizeModel.sq[upperFirst(entityName)];
}

export interface GetRelatedEntityArgs {
  originalEntityId: string;
  relationEntityName: string;
}

export interface GetRelatedEntitiesArgs extends GetRelatedEntityArgs {
  args?: any;
}
