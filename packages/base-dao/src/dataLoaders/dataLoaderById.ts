import DataLoader from 'dataloader';
import { sequelizeDataProvider as dataProvider } from '@venncity/sequelize-data-provider';

async function getEntitiesByIdsInternal(entityName, entityIds) {
  const entities = await dataProvider.getAllEntities(entityName, { where: { id_in: entityIds } });

  // The result array must contain in each index a value corresponding to the id given in that index.
  // See https://github.com/facebook/dataloader#batch-function
  const entitiesToReturn = entityIds.map(entityId => entities.find(entity => entity.id === entityId));
  return entitiesToReturn;
}

export function getDataLoaderById(entityName: string) {
  const dataLoaderById = new DataLoader(keys => getEntitiesByIdsInternal(entityName, keys));
  return dataLoaderById;
}
