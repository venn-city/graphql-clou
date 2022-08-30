import DataLoader from 'dataloader';
import { GetRelatedEntitiesArgs, loadRelatedEntities } from '@venncity/sequelize-data-provider';
import hash from 'object-hash';

export function getDataLoaderForRelatedEntities(entityName: string){
  const dataLoaderForRelatedEntities = new DataLoader<GetRelatedEntitiesArgs, any>(keys => loadRelatedEntities(entityName, keys), {
    cacheKeyFn: key => hash(key)
  });

  return dataLoaderForRelatedEntities;
}

