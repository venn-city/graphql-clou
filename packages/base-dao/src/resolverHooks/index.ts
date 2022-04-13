import creationHooks from './creationHooks';
import updateHooks from './updateHooks';

export const preUpdate = updateHooks.preUpdate;
export const postUpdate = updateHooks.postUpdate;
export const preCreation = creationHooks.preCreation;
export const postCreation = creationHooks.postCreation;

export default {
  ...creationHooks,
  ...updateHooks
};
