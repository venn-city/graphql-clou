import { transformComputedFieldsWhereArguments } from './computedFieldsWhereTransformation';
import mockConfig from '../../../test/mockConfig';

mockConfig();
describe('computedFieldsWhereTransformation', () => {
  afterAll(() => jest.resetAllMocks());
  test('transformComputedFieldsWhereArguments should transform simple computed fields where clause', async () => {
    const originalWhere = {
      extendedFieldFoo: 'bar',
      regularField: 'regularFieldValue'
    };
    const computedWhereArgumentsTransformation = {
      extendedFieldFoo: extendedFieldFoo => {
        return { name_not: extendedFieldFoo };
      }
    };
    const context = {
      DAOs: {
        ministryDAO: {
          computedWhereArgumentsTransformation: {}
        }
      }
    };
    const transformedWhere = await transformComputedFieldsWhereArguments({
      originalWhere,
      whereInputName: 'GovernmentWhereInput',
      computedWhereArgumentsTransformation,
      context
    });
    expect(transformedWhere).toEqual({
      AND: [
        {
          regularField: 'regularFieldValue'
        },
        {
          name_not: 'bar'
        }
      ]
    });
  });
  test('transformComputedFieldsWhereArguments should pass the context and the original where to the transformation function', async () => {
    const originalWhere = {
      extendedFieldFoo: 'bar',
      regularField: 'regularFieldValue'
    };
    const computedWhereArgumentsTransformation = {
      extendedFieldFoo: (extendedFieldFoo, theOriginalWhere, context) => {
        return { name: originalWhere.regularField, name_not: context.DAOs.someKey };
      }
    };
    const context = {
      DAOs: {
        ministryDAO: {
          computedWhereArgumentsTransformation: {}
        },
        someKey: 'VALUE_FROM_CONTEXT'
      }
    };
    const transformedWhere = await transformComputedFieldsWhereArguments({
      originalWhere,
      whereInputName: 'GovernmentWhereInput',
      computedWhereArgumentsTransformation,
      context
    });
    expect(transformedWhere).toEqual({
      AND: [
        {
          regularField: 'regularFieldValue'
        },
        // TODO: Currently context.someKey is undefined, the error might be in the source code cause transformedWhere.name_not is coming as undefined as well.
        // @ts-ignore
        { name: originalWhere.regularField, name_not: context.DAOs.someKey }
      ]
    });
  });

  test('transformComputedFieldsWhereArguments should transform computed fields where clause with boolean operators in top level', async () => {
    const originalWhere = {
      extendedFieldFoo: 'bar'
    };
    const computedWhereArgumentsTransformation = {
      extendedFieldFoo: fooValue => {
        return { OR: [{ extendedFieldFooTwo: fooValue }] };
      },
      extendedFieldFooTwo: fooValue => {
        return { name_not: fooValue };
      }
    };
    const context = {
      DAOs: {
        ministryDAO: {
          computedWhereArgumentsTransformation
        }
      }
    };
    const transformedWhere = await transformComputedFieldsWhereArguments({
      originalWhere,
      whereInputName: 'GovernmentWhereInput',
      computedWhereArgumentsTransformation,
      context
    });
    expect(transformedWhere).toEqual({
      OR: [{ name_not: 'bar' }]
    });
  });

  test('transformComputedFieldsWhereArguments should transform computed fields where clause with related entities', async () => {
    const originalWhere = {
      extendedFieldFoo: 'bar',
      ministries_some: {
        extendedFieldMoo: 'baz'
      }
    };
    const computedWhereArgumentsTransformation = {
      extendedFieldFoo: extendedFieldFoo => {
        return { name_not: extendedFieldFoo };
      }
    };
    const context = {
      DAOs: {
        ministryDAO: {
          computedWhereArgumentsTransformation: {
            extendedFieldMoo: extendedFieldMoo => {
              return { name_starts_with: extendedFieldMoo };
            }
          }
        }
      }
    };
    const transformedWhere = await transformComputedFieldsWhereArguments({
      originalWhere,
      whereInputName: 'GovernmentWhereInput',
      computedWhereArgumentsTransformation,
      context
    });
    expect(transformedWhere).toMatchObject({
      AND: [
        {
          ministries_some: {
            name_starts_with: 'baz'
          }
        },
        { name_not: 'bar' }
      ]
    });
  });
});
