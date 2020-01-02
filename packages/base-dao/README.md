# Base DAO

![Coverage](https://api.venn.city/production/coverage/badge?branch=master&repository=@venncity/base-dao)

Base DAO exports a createEntityDAO function which creates a DAO with the following capabilities:

* a set of CRUD operations, implemented using `sequelize`
* authorization capabilities, using a `daoAuth` _interface_ implemented by the consumer of the package
* CRUD mutations notifications (e.g. can be used for auditing) 
* declarative cascade-delete mechanism
* hooks mechanism, e.g. preSave, preDelete, postFetch, etc.

### Quick start

Generate DAO classes using the following command:

    $ generate-dao-schema --dataModelPath PATH_TO_YOUR_DATA_MODEL --generatedFolderPath PATH_TO_YOUR_GENERATED_FOLDER

* `dataModelPath` is not required and the default value is `src/schema/datamodel.graphql`
* `generatedFolderPath` is not required and the default value is `src/schema/generated`

Add the following scripts to your package.json:
    
    "scripts": {
      "prebuild: "yarn generate-dao-schema",
      "prestart": "yarn generate-dao-schema",
      "generate-dao-schema": "generate-dao-schema"
    }

Example of usage (assume that Survey entity exists)

```ts
import { SurveyDAO } from '../../generated';

const surveyDAO = new SurveyDAO({
    hooks,
    daoAuth, 
    publishCrudEvent
});
...
const createdSurvey = await surveyDAO.createSurvey(...);
```