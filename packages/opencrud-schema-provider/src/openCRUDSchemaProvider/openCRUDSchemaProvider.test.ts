import { openCrudDataModel, openCrudSchema, openCrudSchemaGraphql, getOpenCrudIntrospection } from './openCRUDSchemaProvider';

jest.mock('@venncity/nested-config', () => {
  const dataModelPath = './../../test/datamodel.graphql';
  const sdlPath = './../../test/openCRUD.graphql';
  const dataModelKey = 'graphql.schema.datamodel.path';
  return () => ({
    has: () => true,
    get: (key: string) => {
      if (key === dataModelKey) {
        return dataModelPath;
      }

      return sdlPath;
    }
  });
});

describe('openCrudSchemaProvider', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  test('openCrudDataModel', () => {
    expect(openCrudDataModel).toMatchSnapshot();
  });

  test('openCrudSchema', () => {
    expect(openCrudSchema).toMatchSnapshot();
  });

  test('openCrudSchemaGraphql', () => {
    expect(openCrudSchemaGraphql).toMatchSnapshot();
  });

  test('getOpenCrudIntrospection', () => {
    expect(getOpenCrudIntrospection()).toMatchSnapshot();
  });
});
