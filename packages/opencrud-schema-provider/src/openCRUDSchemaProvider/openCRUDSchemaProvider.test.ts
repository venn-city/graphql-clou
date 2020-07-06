import { openCrudDataModel, openCrudSchema, openCrudSchemaGraphql, getOpenCrudIntrospection } from './openCRUDSchemaProvider';

describe('openCrudSchemaProvider', () => {
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
