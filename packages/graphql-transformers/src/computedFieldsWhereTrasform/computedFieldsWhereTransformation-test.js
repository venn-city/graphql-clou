const { transformComputedFieldsWhereArguments } = require('./computedFieldsWhereTransformation');

describe('computedFieldsWhereTransformation', () => {
  test('transformComputedFieldsWhereArguments should transform simple computed fields where clause', async () => {
    const originalWhere = {
      extendedFieldFoo: 'bar'
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
      name_not: 'bar'
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
