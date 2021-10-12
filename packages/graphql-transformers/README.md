# Graphql Transformers

![Coverage](https://api.venn.city/production/coverage/badge?branch=master&repository=@venncity/graphql-transformers)

## Extended fields where transformation

When extending the openCRUD schema with additional fields, you may want to allow graphql queries where clauses to use 
these fields. In order to resolve these fields, you need to define a computedWhereArgumentsTransformation function on 
your DAO, which maps each field to a corresponding where condition using the default openCRUD schema.
The transformComputedFieldsWhereArguments will then recursively transform the where clause, using the relevant 
DAO.computedWhereArgumentsTransformation based on the fields used in the where clause.
 
For example, we define :

```javascript
    // on the Government (top-level) entity:
    const computedWhereArgumentsTransformation = {
        extendedFieldFoo: extendedFieldFoo => {
        return { name_not: extendedFieldFoo };
        }
    };
```

```javascript
    // On a Ministry related entity:
    const computedWhereArgumentsTransformation = {
        extendedFieldMoo: extendedFieldMoo => {
          return { name_starts_with: extendedFieldMoo };
        }
    }
```

Original where clause:
 ```json
{
    "extendedFieldFoo": "bar",
    "ministries_some": {
    "extendedFieldMoo": "baz"
    }
}
```

will be transformed to:
 ```json
{
    "name_not": "bar",
    "ministries_some": {
        "name_starts_with": "baz"
    }
}
```

