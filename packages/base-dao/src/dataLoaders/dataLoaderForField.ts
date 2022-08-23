import DataLoader from 'dataloader';
import { GetRelatedEntityArgs, sequelizeDataProvider as dataProvider } from '@venncity/sequelize-data-provider';
import hash from 'object-hash';

async function getEntitiesByIdsByField(argsWhereByField, entityName) {
  const key = Object.keys(argsWhereByField[0])[0];
  const entityIds = argsWhereByField.map(e => e[key].id);

  const entities = await dataProvider.getAllEntities(entityName, { where: { [key]: { id_in: entityIds } } });

  // The result array must contain in each index a value corresponding to the id given in that index.
  // See https://github.com/facebook/dataloader#batch-function
  const entitiesToReturn = entityIds.map(entityId => entities.find(entity => entity.id === entityId));
  return entitiesToReturn;
}

export function getDataLoaderForField(entityName: string){
  const dataLoaderForField: DataLoader<GetRelatedEntityArgs, any> = new DataLoader(keys => getEntitiesByIdsByField(entityName, keys), {
    cacheKeyFn: key => hash(key)
  });

  return dataLoaderForField;
};
