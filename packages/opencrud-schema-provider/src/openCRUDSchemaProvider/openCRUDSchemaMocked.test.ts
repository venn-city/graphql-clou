import { getOpenCrudIntrospection, openCrudDataModel, openCrudSchema, openCrudSchemaGraphql } from './openCRUDSchemaProvider';

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

describe('mock datamodels', () => {
  afterAll(() => jest.restoreAllMocks());

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
