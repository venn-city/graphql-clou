import sqOriginal from './sequelizeInit';
import { baseModel as OriginalBaseModel} from './base/baseModel';
import { getCommonDbColumnDefinitions as originalGetCommonDbColumnDefinitions } from './commonColumnDefintions';

export const baseModel = OriginalBaseModel;
export const getCommonDbColumnDefinitions = originalGetCommonDbColumnDefinitions;
export const sq = sqOriginal;

export default {
  sq:  sqOriginal,
  baseModel: OriginalBaseModel,
  getCommonDbColumnDefinitions: originalGetCommonDbColumnDefinitions
};

