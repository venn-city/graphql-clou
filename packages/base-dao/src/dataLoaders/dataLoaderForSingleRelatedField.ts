import DataLoader from 'dataloader';
import { GetRelatedEntityArgs, loadSingleRelatedEntities } from '@venncity/sequelize-data-provider';
import hash from 'object-hash';

export function getDataLoaderForSingleRelatedEntity(entityName: string) {
  const dataLoaderForSingleRelatedEntity: DataLoader<GetRelatedEntityArgs, any> = new DataLoader(
    keys => loadSingleRelatedEntities(entityName, keys),
    {
      cacheKeyFn: key => hash(key)
    }
  );

  return dataLoaderForSingleRelatedEntity;
}
