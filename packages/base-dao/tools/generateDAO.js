const { lowerFirst, upperFirst } = require('lodash');
const pluralize = require('pluralize');

function generateDAOClass(entityName) {
  const entityNameLowerFirstLetter = lowerFirst(entityName);
  const entityNameUpperFirstLetter = upperFirst(entityName);
  const entitiesNameLowerFirstLetter = lowerFirst(pluralize(entityName));
  const entitiesNameUpperFirstLetter = upperFirst(pluralize(entityName));

  return `
  import { createEntityDAO } from '@venncity/base-dao';
  import * as graphqlTypes from './types';
  
  export default class ${entityNameUpperFirstLetter}DAO {
    private readonly baseDAO: any;
  
    constructor({ hooks, daoAuth, publishCrudEvent }: { hooks: any; daoAuth: any; publishCrudEvent: any }) {
      const baseDAO = createEntityDAO({
        entityName: '${entityNameLowerFirstLetter}',
        hooks,
        daoAuth,
        publishCrudEvent
      });
      this.baseDAO = baseDAO;
    }
  
    ${entityNameLowerFirstLetter}(context: any, where: graphqlTypes.Query${entityNameUpperFirstLetter}Args['where']): Promise<null | graphqlTypes.Query['${entityNameLowerFirstLetter}']> {
      return this.baseDAO.entitiy(context, where);
    }
  
    ${entityNameLowerFirstLetter}ById(context: any, id: graphqlTypes.Scalars['ID']): Promise<null | graphqlTypes.Query['${entityNameLowerFirstLetter}']> {
      return this.baseDAO.entitiyById(context, id);
    }
  
    ${entitiesNameLowerFirstLetter}(context: any, args: graphqlTypes.Query${entitiesNameUpperFirstLetter}Args): Promise<graphqlTypes.Query['${entitiesNameLowerFirstLetter}']> {
      return this.baseDAO.entities(context, args);
    }
  
    ${entitiesNameLowerFirstLetter}ByIds(context: any, ids: graphqlTypes.Scalars['ID'][]): Promise<graphqlTypes.Query['${entitiesNameLowerFirstLetter}']> {
      return this.baseDAO.entitiesByIds(context, ids);
    }
  
    create${entityNameUpperFirstLetter}(context: any, data: graphqlTypes.MutationCreate${entityNameUpperFirstLetter}Args['data']): Promise<graphqlTypes.Mutation['create${entityNameUpperFirstLetter}']> {
      return this.baseDAO.createEntity(context, data);
    }
  
    update${entityNameUpperFirstLetter}(context: any, args: graphqlTypes.MutationUpdate${entityNameUpperFirstLetter}Args): Promise<null | graphqlTypes.Mutation['update${entityNameUpperFirstLetter}']> {
      return this.baseDAO.updateEntity(context, args);
    }
  
    updateMany${entitiesNameUpperFirstLetter}(context: any, args: graphqlTypes.MutationUpdateMany${entitiesNameUpperFirstLetter}Args): Promise<graphqlTypes.Mutation['updateMany${entitiesNameUpperFirstLetter}']> {
      return this.baseDAO.updateManyEntities(context, args);
    }
  
    delete${entityNameUpperFirstLetter}(context: any, where: graphqlTypes.MutationDelete${entityNameUpperFirstLetter}Args['where']): Promise<null | graphqlTypes.Mutation['delete${entityNameUpperFirstLetter}']> {
      return this.baseDAO.deleteEntity(context, where);
    }
  
    deleteMany${entitiesNameUpperFirstLetter}(context: any, where: graphqlTypes.MutationDeleteMany${entitiesNameUpperFirstLetter}Args['where']): Promise<graphqlTypes.Mutation['deleteMany${entitiesNameUpperFirstLetter}']> {
      return this.baseDAO.deleteManyEntities(context, where);
    }
  
    ${entityNameLowerFirstLetter}Connection(parent: any, args: graphqlTypes.Query${entitiesNameUpperFirstLetter}ConnectionArgs, context: any): Promise<graphqlTypes.Query['${entitiesNameLowerFirstLetter}Connection']> {
      return this.baseDAO.entitiesConnection(parent, args, context);
    }
  }`;
}

module.exports = generateDAOClass;
