import creationHooksOriginal from './resolverHooks/creationHooks';
import updateHooksOriginal from './resolverHooks/updateHooks';

export const creationHooks = creationHooksOriginal;
export const updateHooks = updateHooksOriginal;

export default {
  ...creationHooks,
  ...updateHooks
};
