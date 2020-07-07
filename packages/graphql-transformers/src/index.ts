import { transformComputedFieldsWhereArguments as transformComputedFieldsWhereArgumentsOriginal } from './computedFieldsWhereTrasform/computedFieldsWhereTransformation';
import { openCrudToSequelize as openCrudToSequelizeOriginal } from './openCrudWhereTransform/openCRUDtoSequelizeWhereTransformer';
import sequelizeConstsOriginal from './openCrudWhereTransform/sequelizeConsts';

export const sequelizeConsts = sequelizeConstsOriginal;
export const openCrudToSequelize = openCrudToSequelizeOriginal;
export const transformComputedFieldsWhereArguments = transformComputedFieldsWhereArgumentsOriginal;

export default {
  transformComputedFieldsWhereArguments: transformComputedFieldsWhereArgumentsOriginal,
  openCrudToSequelize: openCrudToSequelizeOriginal,
  sequelizeConsts: sequelizeConstsOriginal
};
