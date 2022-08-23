import { getDataLoaderById } from './dataLoaderById';
import { getDataLoaderForField } from './dataLoaderForField';
import { getDataLoaderForRelatedEntities } from './dataLoaderForRelatedEntities';
import { getDataLoaderForSingleRelatedEntity } from './dataLoaderForSingleRelatedField';

export function createLoaders(entityName) {
  return {
    dataLoaderById: getDataLoaderById(entityName),
    dataLoaderForField: getDataLoaderForField(entityName),
    dataLoaderForRelatedEntities: getDataLoaderForRelatedEntities(entityName),
    dataLoaderForSingleRelatedField: getDataLoaderForSingleRelatedEntity(entityName)
  };
}
