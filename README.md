# Graphql Clou

A mono-repo for sequelize-based graphql opencrud data-access packages

## Packages:

* `base-dao` - the main _api_ package of the project. Exposes a per-entity data-access-object with a set of 
    CRUD operations for each entity.
* `cascade-delete` - OpenCRUD data-model-based declarative implementation of cascade-delete/disconnect
* `clou-utils` - a package containing common utils code required in this project
* `graphql-transformers` - a package containing transformers between a graphql-api and lower implementation layers
* `nested-mutation-hooks` - pre/post resolve-operation hooks, designed to allow resolving OpenCRUD nested mutation api, 
    one level at a time (similarly to the way standard apollo server resolvers work on queried nested-entities)
* `opencrud-schema-provider` - a package providing an OpenCRUD data-model and schema in different representations
* `sequelize-data-provider` - a package providing DB access. Inputs should conform with OpenCRUD schema. 
    Implemented using sequelize based on an OpenCRUD data-model
* `sequelize-model` - package loading and initializing sequelize with entity models

a schematic and somehow simplistic illustration of a common flow between the packages would be:

```markdown
    nested-mutation-hooks (only for mutations, queries are resolved as is) =>
    base-dao =>
    graphql-transformers (computed-fields transformation, if such exist to OpenCRUD fields) =>
    sequelize-data-provider =>
    graphql-transformers (OpenCrud to sequelize transformation) =>
    sequelize-model (the actual execution of sequelize operations which are translated to SQL queries)
```

## Development guide:
* circleci is used for ci, see `.circleci/config.yml` for details

### Running a local server:
* To run a local apollo-server using the provided test entities, for a more interactive experience,
    you can run:
```shell script
packages/nested-mutation-hooks$ yarn start:local
```
* Then connect using your favourite graphql client (e.g. a playground would open on http://localhost:7777/graphql)

### Debugging
* To see all executed SQL queries, change `sequelize.logging` to `true`, in 
`/packages/sequelize-model/config/default.json`

### Testing
* All tests are written using `jest`
* Most tests in this project are using a dockerized postgres instance to run queries 
    (so they are more of _integration_ rather than pure _unit_ tests)
* To re-start the dockerized postges instance, run: 
```shell script
$ yarn db:bootstrap:local
```
* The tests in this repo are using government-themed entities (government, ministries, ministers, etc.); 
    (which by purpose has no rapport whatsoever with venn-city's business entities/domain)
    it is designed to represent entities with different attributes (different data-types) and relations (1x1, 1xn and other mappings)
    and should be extended as more features need to be implemented and tested
* If you encounter a flow (e.g. part of the OpenCRUD spec) that should be supported but is not implemented, 
    write a failing tests and set it to `skip` ```test.skip('you test desc...')```

### Data-model & Schema (and how to modify it)
* A lot of logic in this project is based on a data-model described in a `datamodel.graphql` file.
    This file is using .graphql syntax but is not an actual graphql schema, 
    but rather a declarative description of the model entities and their relations and attributes 
    (you can think about it as the ORM mapping of the model entities to the DB tables, 
    in this project there is some duplication as similar mapping is also performed in the *-model.js sequelize mapping files)
* If you're changing the data model (that is the `./packages/opencrud-schema-provider/test/datamodel.graphql`) 
    and the sequelize model files; you need to then run:
```shell script
packages/opencrud-schema-provider$ yarn generate-opencrud-schema:test
```

### Contributing
* Create a new branch
* Do your changes and add tests:
    * integration tests (dockerized-DB based) are required if any core / sequelize-related flows are affected
    * if only peripheral (e.g. utilities) code was affected - pure unit tests would suffice
* Commit changes and open a PR briefly describing the changes
* Note that this project is using the conventional-commits spec for package versioning, so all commits need to adhere to it

## Misc:
* To run the local postgres DB on a different port, e.g. 5433, change the `config.db_port` in package.json and
 the `DB_PORT` in the `.env` file.
