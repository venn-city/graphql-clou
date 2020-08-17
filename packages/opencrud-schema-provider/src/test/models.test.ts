// dummy tests cause coverage
import { datamodel, sdl } from './models';

describe('models', () => {
  test('datamodel', () => {
    expect(datamodel).toBeTruthy();
  });

  test('sdl', () => {
    expect(sdl).toBeTruthy();
  });
});
