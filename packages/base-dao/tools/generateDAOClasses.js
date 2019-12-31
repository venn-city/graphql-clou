const { lowerFirst, upperFirst } = require('lodash');
const pluralize = require('pluralize');
const prismaGenerateSchema = require('prisma-generate-schema');
const dedent = require('dedent');

function generateDAOClass(entityName) {
  const entityNameLowerFirstLetter = lowerFirst(entityName);
  const entityNameUpperFirstLetter = upperFirst(entityName);
  const entitiesNameLowerFirstLetter = lowerFirst(pluralize(entityName));
  const entitiesNameUpperFirstLetter = upperFirst(pluralize(entityName));

  return dedent(`
  import { createEntityDAO } from '@venncity/base-dao';
  import * as openCrudSchema from './openCrudSchema';
  
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
  
    ${entityNameLowerFirstLetter}(context: any, where: openCrudSchema.Query${entityNameUpperFirstLetter}Args['where']): Promise<null | openCrudSchema.Query['${entityNameLowerFirstLetter}']> {
      return this.baseDAO.entitiy(context, where);
    }
  
    ${entityNameLowerFirstLetter}ById(context: any, id: openCrudSchema.Scalars['ID']): Promise<null | openCrudSchema.Query['${entityNameLowerFirstLetter}']> {
      return this.baseDAO.entitiyById(context, id);
    }
  
    ${entitiesNameLowerFirstLetter}(context: any, args: openCrudSchema.Query${entitiesNameUpperFirstLetter}Args): Promise<openCrudSchema.Query['${entitiesNameLowerFirstLetter}']> {
      return this.baseDAO.entities(context, args);
    }
  
    ${entitiesNameLowerFirstLetter}ByIds(context: any, ids: openCrudSchema.Scalars['ID'][]): Promise<openCrudSchema.Query['${entitiesNameLowerFirstLetter}']> {
      return this.baseDAO.entitiesByIds(context, ids);
    }
  
    create${entityNameUpperFirstLetter}(context: any, data: openCrudSchema.MutationCreate${entityNameUpperFirstLetter}Args['data']): Promise<openCrudSchema.Mutation['create${entityNameUpperFirstLetter}']> {
      return this.baseDAO.createEntity(context, data);
    }
  
    update${entityNameUpperFirstLetter}(context: any, args: openCrudSchema.MutationUpdate${entityNameUpperFirstLetter}Args): Promise<null | openCrudSchema.Mutation['update${entityNameUpperFirstLetter}']> {
      return this.baseDAO.updateEntity(context, args);
    }
  
    updateMany${entitiesNameUpperFirstLetter}(context: any, args: openCrudSchema.MutationUpdateMany${entitiesNameUpperFirstLetter}Args): Promise<openCrudSchema.Mutation['updateMany${entitiesNameUpperFirstLetter}']> {
      return this.baseDAO.updateManyEntities(context, args);
    }
  
    delete${entityNameUpperFirstLetter}(context: any, where: openCrudSchema.MutationDelete${entityNameUpperFirstLetter}Args['where']): Promise<null | openCrudSchema.Mutation['delete${entityNameUpperFirstLetter}']> {
      return this.baseDAO.deleteEntity(context, where);
    }
  
    deleteMany${entitiesNameUpperFirstLetter}(context: any, where: openCrudSchema.MutationDeleteMany${entitiesNameUpperFirstLetter}Args['where']): Promise<openCrudSchema.Mutation['deleteMany${entitiesNameUpperFirstLetter}']> {
      return this.baseDAO.deleteManyEntities(context, where);
    }
  
    ${entityNameLowerFirstLetter}Connection(parent: any, args: openCrudSchema.Query${entitiesNameUpperFirstLetter}ConnectionArgs, context: any): Promise<openCrudSchema.Query['${entitiesNameLowerFirstLetter}Connection']> {
      return this.baseDAO.entitiesConnection(parent, args, context);
    }
  }`);
}

function generateDAOClasses(dataModel) {
  const sdl = prismaGenerateSchema.parseInternalTypes(dataModel, 'postgres');

  return sdl.types.reduce((prev, { isEnum, name }) => {
    if (isEnum) {
      return prev;
    }
    return {
      ...prev,
      [lowerFirst(name)]: generateDAOClass(name)
    };
  }, {});
}

module.exports = generateDAOClasses;
