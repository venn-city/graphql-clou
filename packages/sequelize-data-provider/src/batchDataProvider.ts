import { partition, uniq, upperFirst, isEmpty } from 'lodash';
import async from 'async';
import sequelizeModel from '@venncity/sequelize-model';
import opencrudSchemaProvider from '@venncity/opencrud-schema-provider';
import { extractManyResult, extractSingleResult } from './resultExtractionHelper';

const { getFieldType } = opencrudSchemaProvider.graphqlSchemaUtils;
const { openCrudSchema: schema } = opencrudSchemaProvider;

export async function loadSingleRelatedEntities(entityName: string, keys: readonly GetRelatedEntityArgs[]) {
  const originalEntities = await fetchEntitiesWithRelations(keys, entityName);
  return keys.map(k => extractSingleResult(originalEntities.find(o => o.dataValues.id === k.originalEntityId)?.dataValues, k.relationEntityName));
}

export async function loadRelatedEntities(
  entityName: string,
  keys: readonly GetRelatedEntitiesArgs[],
  getRelatedEntities: (entityName: string, originalEntityId: string, relationFieldName: string, args?: any) => any
) {
  const [keysWithoutArgs, keysWithArgs] = partition(keys, k => isEmpty(k));

  const originalEntitiesWithoutArgs = await fetchEntitiesWithRelations(keysWithoutArgs, entityName);
  const originalEntitiesWithArgs: { key: GetRelatedEntitiesArgs; relatedEntitiesWithArgs: any[] }[] = await async.map(
    keysWithArgs,
    async keyWithArgs => {
      const relatedEntitiesWithArgs = await getRelatedEntities(
        entityName,
        keyWithArgs.originalEntityId,
        keyWithArgs.relationEntityName,
        keyWithArgs.args
      );
      return {
        key: keyWithArgs,
        relatedEntitiesWithArgs
      };
    }
  );

  return mapResultsToKeys(keys, originalEntitiesWithArgs, originalEntitiesWithoutArgs);
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
    const originalEntityWithArgs = originalEntitiesWithArgs.find(originalEntity => originalEntity.key === k);
    if (originalEntityWithArgs) {
      return originalEntityWithArgs.relatedEntitiesWithArgs;
    }
    const originalEntityWithoutArgs = originalEntitiesWithoutArgs.find(originalEntity => originalEntity.dataValues.id === k.originalEntityId);
    if (originalEntityWithoutArgs) {
      const relatedEntities = originalEntityWithoutArgs[k.relationEntityName];
      return extractManyResult(relatedEntities);
    }
    return undefined;
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
