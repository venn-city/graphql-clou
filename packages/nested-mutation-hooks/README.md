# Nested Mutation Hooks

![Coverage](https://api.venn.city/production/coverage/badge?branch=master&repository=@venncity/nested-mutation-hooks)

`preCreation` / `postCreation` and `preUpdate` / `postUpdate` hooks, designed to allow resolving OpenCRUD nested mutation api, 
one level at a time (similarly to the way standard apollo server resolvers work on queried nested-entities).

This allows implementing simpler resolving logic, as each mutation resolving has to only deal with the current entity (/level).
Useful for implementing authorization checks, auditing entity changes, and more.
