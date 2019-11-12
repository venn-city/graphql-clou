# Base DAO

![Coverage](https://api.venn.city/production/coverage/badge?branch=master&repository=@venncity/base-dao)

Base DAO exports a createEntityDAO function which creates a DAO with the following capabilities:

* a set of CRUD operations, implemented using `sequelize`
* authorization capabilities, using a `daoAuth` _interface_ implemented by the consumer of the package
* CRUD mutations notifications (e.g. can be used for auditing) 
* declarative cascade-delete mechanism
* hooks mechanism, e.g. preSave, preDelete, postFetch, etc.
