/* eslint-disable import/first */
import { sequelizeDataProvider as dataProvider } from '@venncity/sequelize-data-provider';
import { createTestClient } from 'apollo-server-testing';
import { hacker } from 'faker';
import sinon from 'sinon';
import { sq } from '@venncity/sequelize-model';
import resolvers from './test/graphqlTestServer/schema/resolvers';
import models from '../../../test/model';

const mutationSpies = createMutationSpies();
import { startApolloServer } from './test/graphqlTestServer';

const { mutate } = createTestClient(startApolloServer());

sq.init(models);

describe('Nested mutations', () => {
  afterEach(() => {
    Object.values(mutationSpies).forEach((mutationSpy: any) => mutationSpy.resetHistory());
  });

  describe('Nested mutation field is Object', () => {
    describe('Relation owner is parent', () => {
      test('CREATE Ministry with nested CREATE Minister', async () => {
        const nameValue = hacker.noun();
        const response = await executeMutation(
          `
              mutation($name: String!) {
                createMinistry(
                  data: {
                    name: $name
                    minister: { create: { name: $name } }
                    government: { create: { name: $name } }
                  }
                ) {
                  name
                  minister {
                    name
                  }
                  government {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue
          }
        );
        const ministry = response?.data?.createMinistry;
        expect(ministry).toHaveProperty('name', nameValue);
        expect(ministry.minister).toHaveProperty('name', nameValue);
        expect(ministry.government).toHaveProperty('name', nameValue);

        expect(mutationSpies.createMinistry.calledOnce).toBeTruthy();
        expect(mutationSpies.createMinister.calledOnce).toBeTruthy();
      });

      test('CREATE Ministry with nested CONNECT Minister', async () => {
        const nameValue = hacker.noun();
        const minister = await dataProvider.createEntity('Minister', {
          name: nameValue
        });
        const government = await dataProvider.createEntity('Government', {
          name: nameValue
        });

        const response = await executeMutation(
          `
              mutation(
                $name: String!, 
                $ministerId: ID!
                $governmentId: ID!
              ) {
                createMinistry(
                  data: {
                    name: $name
                    minister: { connect: { id: $ministerId } }
                    government: { connect: { id: $governmentId } }
                  }
                ) {
                  name
                  minister {
                    name
                  }
                  government {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministerId: minister.id,
            governmentId: government.id
          }
        );
        const ministry = response?.data?.createMinistry;
        expect(ministry).toHaveProperty('name', nameValue);
        expect(ministry.minister).toHaveProperty('name', nameValue);
        expect(ministry.government).toHaveProperty('name', nameValue);

        expect(mutationSpies.createMinistry.calledOnce).toBeTruthy();
        expect(mutationSpies.updateMinister.notCalled).toBeTruthy();
        expect(mutationSpies.updateGovernment.notCalled).toBeTruthy();
      });

      test('UPDATE Ministry with nested CREATE Minister', async () => {
        const nameInitialValue = hacker.noun();
        const nameValue = hacker.noun();
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue
        });

        const response = await executeMutation(
          `
              mutation($name: String!, $ministryId: ID!) {
                updateMinistry(
                  data: {
                    name: $name
                    minister: { create: { name: $name } }
                    government: { create: { name: $name } }
                  }
                  where: {
                    id: $ministryId
                  }
                ) {
                  name
                  minister {
                    name
                  }
                  government {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministryId: ministry.id
          }
        );
        const updatedMinistry = response?.data?.updateMinistry;
        expect(updatedMinistry).toHaveProperty('name', nameValue);
        expect(updatedMinistry.minister).toHaveProperty('name', nameValue);
        expect(updatedMinistry.government).toHaveProperty('name', nameValue);

        expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
        expect(mutationSpies.createMinister.calledOnce).toBeTruthy();
        expect(mutationSpies.createGovernment.calledOnce).toBeTruthy();
      });

      test('UPDATE Ministry with nested CONNECT Minister', async () => {
        const nameInitialValue = hacker.noun();
        const nameValue = hacker.noun();
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue
        });
        const minister = await dataProvider.createEntity('Minister', {
          name: nameInitialValue
        });
        const government = await dataProvider.createEntity('Government', {
          name: nameInitialValue
        });

        const response = await executeMutation(
          `
              mutation(
                $name: String!, 
                $ministryId: ID!, 
                $ministerId: ID!
                $governmentId: ID!
              ) {
                updateMinistry(
                  data: {
                    name: $name
                    minister: { connect: { id: $ministerId } }
                    government: { connect: { id: $governmentId } }
                  }
                  where: {
                    id: $ministryId
                  }
                ) {
                  name
                  minister {
                    name
                  }
                  government {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministryId: ministry.id,
            ministerId: minister.id,
            governmentId: government.id
          }
        );
        const updatedMinistry = response?.data?.updateMinistry;
        expect(updatedMinistry).toHaveProperty('name', nameValue);
        expect(updatedMinistry.minister).toHaveProperty('name', nameInitialValue);
        expect(updatedMinistry.government).toHaveProperty('name', nameInitialValue);

        expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
        expect(mutationSpies.updateMinister.notCalled).toBeTruthy();
        expect(mutationSpies.updateGovernment.notCalled).toBeTruthy();
      });

      test('UPDATE Ministry with nested UPDATE Minister', async () => {
        const nameInitialValue = hacker.noun();
        const nameValue = hacker.noun();

        const minister = await dataProvider.createEntity('Minister', {
          name: nameInitialValue
        });
        const government = await dataProvider.createEntity('Government', {
          name: nameInitialValue
        });
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue,
          minister: {
            connect: {
              id: minister.id
            }
          },
          government: {
            connect: {
              id: government.id
            }
          }
        });

        const response = await executeMutation(
          `
              mutation($name: String!, 
                  $ministryId: ID!) {
                updateMinistry(
                  data: {
                    name: $name
                    minister: { 
                      update: { 
                        name: $name
                      } 
                    }
                    government: { 
                      update: { 
                        name: $name
                      } 
                    }
                  }
                  where: {
                    id: $ministryId
                  }
                ) {
                  name
                  minister {
                    name
                  }
                  government {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministryId: ministry.id
          }
        );
        const updatedMinistry = response?.data?.updateMinistry;
        expect(updatedMinistry).toHaveProperty('name', nameValue);
        expect(updatedMinistry.minister).toHaveProperty('name', nameValue);
        expect(updatedMinistry.government).toHaveProperty('name', nameValue);

        expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
        expect(mutationSpies.updateMinister.calledOnce).toBeTruthy();
        expect(mutationSpies.updateGovernment.calledOnce).toBeTruthy();
      });

      test('UPDATE Ministry with nested DISCONNECT Minister', async () => {
        const nameInitialValue = hacker.noun();
        const nameValue = hacker.noun();
        const minister = await dataProvider.createEntity('Minister', {
          name: nameInitialValue
        });
        const government = await dataProvider.createEntity('Government', {
          name: nameInitialValue
        });
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue,
          minister: {
            connect: {
              id: minister.id
            }
          },
          government: {
            connect: {
              id: government.id
            }
          }
        });

        const response = await executeMutation(
          `
              mutation($name: String!, 
                  $ministryId: ID!) {
                updateMinistry(
                  data: {
                    name: $name
                    minister: { 
                      disconnect: true
                    }
                    government: { 
                      disconnect: true
                    }
                  }
                  where: {
                    id: $ministryId
                  }
                ) {
                  name
                  minister {
                    name
                  }                  
                  government {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministryId: ministry.id
          }
        );
        const updatedMinistry = response?.data?.updateMinistry;
        expect(updatedMinistry).toHaveProperty('name', nameValue);
        expect(updatedMinistry.minister).toBeNull();
        expect(updatedMinistry.government).toBeNull();

        expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
        expect(mutationSpies.updateMinister.notCalled).toBeTruthy();
        expect(mutationSpies.updateGovernment.notCalled).toBeTruthy();
      });

      test('UPDATE Ministry with nested DELETE Minister', async () => {
        const nameInitialValue = hacker.noun();
        const nameValue = hacker.noun();

        const minister = await dataProvider.createEntity('Minister', {
          name: nameInitialValue
        });
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue,
          minister: {
            connect: {
              id: minister.id
            }
          }
        });

        const response = await executeMutation(
          `
              mutation($name: String!, 
                  $ministryId: ID!) {
                updateMinistry(
                  data: {
                    name: $name
                    minister: { 
                      delete: true
                    }
                  }
                  where: {
                    id: $ministryId
                  }
                ) {
                  name
                  minister {
                    name
                  }                  
                  government {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministryId: ministry.id
          }
        );
        const updatedMinistry = response?.data?.updateMinistry;
        expect(updatedMinistry).toHaveProperty('name', nameValue);
        const deleteMinister = await dataProvider.getEntity('Minister', { id: minister.id });
        expect(deleteMinister).toBeNull();

        expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
        expect(mutationSpies.deleteMinister.calledOnce).toBeTruthy();
      });
    });

    describe('Relation owner is nested', () => {
      test('CREATE Minister with nested CREATE Ministry', async () => {
        const nameValue = hacker.noun();
        const response = await executeMutation(
          `
              mutation($name: String!) {
                createMinister(
                  data: {
                    name: $name
                    ministry: { create: { name: $name } }
                  }
                ) {
                  name
                  ministry {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue
          }
        );
        const minister = response?.data?.createMinister;
        expect(minister).toHaveProperty('name', nameValue);
        expect(minister.ministry).toHaveProperty('name', nameValue);

        expect(mutationSpies.createMinister.calledOnce).toBeTruthy();
        expect(mutationSpies.createMinistry.calledOnce).toBeTruthy();
      });

      test('CREATE Minister with nested CONNECT Ministry', async () => {
        const nameValue = hacker.noun();
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameValue
        });

        const response = await executeMutation(
          `
              mutation($name: String!, $ministryId: ID!) {
                createMinister(
                  data: {
                    name: $name
                    ministry: { connect: { id: $ministryId } }
                  }
                ) {
                  name
                  ministry {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministryId: ministry.id
          }
        );
        const minister = response?.data?.createMinister;
        expect(minister).toHaveProperty('name', nameValue);
        expect(minister.ministry).toHaveProperty('name', nameValue);

        expect(mutationSpies.createMinister.calledOnce).toBeTruthy();
        expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
      });

      test('UPDATE Minister with nested CREATE Ministry', async () => {
        const nameInitialValue = hacker.noun();
        const nameValue = hacker.noun();
        const minister = await dataProvider.createEntity('Minister', {
          name: nameInitialValue
        });

        const response = await executeMutation(
          `
              mutation($name: String!, $ministerId: ID!) {
                updateMinister(
                  data: {
                    name: $name
                    ministry: { create: { name: $name } }
                  }
                  where: {
                    id: $ministerId
                  }
                ) {
                  name
                  ministry {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministerId: minister.id
          }
        );
        const updatedMinister = response?.data?.updateMinister;
        expect(updatedMinister).toHaveProperty('name', nameValue);
        expect(updatedMinister.ministry).toHaveProperty('name', nameValue);

        expect(mutationSpies.updateMinister.calledOnce).toBeTruthy();
        expect(mutationSpies.createMinistry.calledOnce).toBeTruthy();
      });

      test('UPDATE Minister with nested CONNECT Ministry', async () => {
        const nameValue = hacker.noun();
        const minister = await dataProvider.createEntity('Minister', {
          name: nameValue
        });
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameValue
        });

        const response = await executeMutation(
          `
              mutation($name: String!, 
                  $ministerId: ID!, 
                  $ministryId: ID!) {
                updateMinister(
                  data: {
                    name: $name
                    ministry: { connect: { id: $ministryId } }
                  }
                  where: {
                    id: $ministerId
                  }
                ) {
                  name
                  ministry {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministerId: minister.id,
            ministryId: ministry.id
          }
        );
        const updatedMinister = response?.data?.updateMinister;
        expect(updatedMinister).toHaveProperty('name', nameValue);
        expect(updatedMinister.ministry).toHaveProperty('name', nameValue);

        expect(mutationSpies.updateMinister.calledOnce).toBeTruthy();
        expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
      });

      test('UPDATE Minister with nested UPDATE Ministry', async () => {
        const nameValue = hacker.noun();
        const minister = await dataProvider.createEntity('Minister', {
          name: nameValue
        });
        await dataProvider.createEntity('Ministry', {
          name: nameValue,
          minister: {
            connect: {
              id: minister.id
            }
          }
        });

        const response = await executeMutation(
          `
              mutation($name: String!, 
                  $ministerId: ID!) {
                updateMinister(
                  data: {
                    name: $name
                    ministry: { 
                      update: { 
                        name: $name
                      } 
                    }
                  }
                  where: {
                    id: $ministerId
                  }
                ) {
                  name
                  ministry {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministerId: minister.id
          }
        );
        const updatedMinister = response?.data?.updateMinister;
        expect(updatedMinister).toHaveProperty('name', nameValue);
        expect(updatedMinister.ministry).toHaveProperty('name', nameValue);

        expect(mutationSpies.updateMinister.calledOnce).toBeTruthy();
        expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
      });

      test('UPDATE Minister with nested DISCONNECT Ministry', async () => {
        const nameValue = hacker.noun();
        const minister = await dataProvider.createEntity('Minister', {
          name: nameValue
        });
        await dataProvider.createEntity('Ministry', {
          name: nameValue,
          minister: {
            connect: {
              id: minister.id
            }
          }
        });

        const response = await executeMutation(
          `
              mutation($name: String!, 
                  $ministerId: ID!) {
                updateMinister(
                  data: {
                    name: $name
                    ministry: { 
                      disconnect: true
                    }
                  }
                  where: {
                    id: $ministerId
                  }
                ) {
                  name
                  ministry {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministerId: minister.id
          }
        );
        const updatedMinister = response?.data?.updateMinister;
        expect(updatedMinister).toHaveProperty('name', nameValue);
        expect(updatedMinister.ministry).toBeNull();

        expect(mutationSpies.updateMinister.calledOnce).toBeTruthy();
        expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
      });

      test('UPDATE Minister with nested DELETE Ministry', async () => {
        const nameValue = hacker.noun();
        const minister = await dataProvider.createEntity('Minister', {
          name: nameValue
        });
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameValue,
          minister: {
            connect: {
              id: minister.id
            }
          }
        });

        const response = await executeMutation(
          `
              mutation($name: String!, 
                  $ministerId: ID!) {
                updateMinister(
                  data: {
                    name: $name
                    ministry: { 
                      delete: true
                    }
                  }
                  where: {
                    id: $ministerId
                  }
                ) {
                  name
                  ministry {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministerId: minister.id
          }
        );
        const updatedMinister = response?.data?.updateMinister;
        expect(updatedMinister).toHaveProperty('name', nameValue);
        const deletedMinistry = await dataProvider.getEntity('Ministry', { id: ministry.id });

        expect(deletedMinistry).toBeNull();

        expect(mutationSpies.updateMinister.calledOnce).toBeTruthy();
        expect(mutationSpies.deleteMinistry.calledOnce).toBeTruthy();
      });
    });

    describe('One to many relation using relation table', () => {
      describe('From Vote to Minister', () => {
        test('CREATE vote with nested CREATE minister', async () => {
          const ministerName = hacker.noun();
          const voteName = hacker.noun();
          const createdVote = await executeMutation(
            `
            mutation ($ministerName: String!, $voteName: String!){
              createVote(data: {
                name: $voteName
                minister: {create: {name: $ministerName}}
              })
              {
                id
                name
                minister {
                  id
                  name
                }
              }
            }
        `,
            {
              ministerName,
              voteName
            }
          );
          const vote = createdVote?.data?.createVote;
          expect(vote).toHaveProperty('minister.id');
          expect(vote).toHaveProperty('minister.name', ministerName);

          expect(mutationSpies.createVote.calledOnce).toBeTruthy();
          expect(mutationSpies.createMinister.calledOnce).toBeTruthy();
        });
        test('CREATE vote with nested CONNECT minister', async () => {
          const ministerName = hacker.noun();
          const createdMinister = await executeMutation(
            `
            mutation($name: String!) {
              createMinister(data: {
                name: $name
              })
              {
                id
              }
            }
        `,
            { name: ministerName }
          );
          const minister = createdMinister?.data?.createMinister;
          const voteName = hacker.noun();
          const createdVote = await executeMutation(
            `
            mutation ($ministerId: ID!, $voteName: String!){
              createVote(data: {
                name: $voteName
                minister: {connect: {id: $ministerId}}
              })
              {
                id
                name
                minister {
                  id
                  name
                }
              }
            }
        `,
            {
              ministerId: minister.id,
              voteName
            }
          );
          const vote = createdVote?.data?.createVote;
          expect(vote).toHaveProperty('minister.id', minister.id);
          expect(vote).toHaveProperty('minister.name', ministerName);

          expect(mutationSpies.createVote.calledOnce).toBeTruthy();
          expect(mutationSpies.updateMinister.notCalled).toBeTruthy();
        });
        test('UPDATE vote with nested CONNECT minister', async () => {
          const ministerName = hacker.noun();
          const createdMinister = await executeMutation(
            `
            mutation($name: String!) {
              createMinister(data: {
                name: $name
              })
              {
                id
              }
            }
        `,
            { name: ministerName }
          );
          const minister = createdMinister?.data?.createMinister;
          const createdVote = await executeMutation(
            `
            mutation {
              createVote(data: {
                name: "vote1"
              })
              {
                id
                name
                minister {
                  id
                }
              }
            }
        `,
            {}
          );
          const vote = createdVote?.data?.createVote;
          expect(vote.minister).toBeFalsy();
          const updatedVoteWithMinister = await executeMutation(
            `
            mutation($ministerId: ID!, $voteId: ID!) {
              updateVote(
                where: { id: $voteId }
                data: {
                  minister: { connect: {id: $ministerId}}
               }
              ) {
                id
                minister {
                  id
                }
              }
            }
        `,
            {
              ministerId: minister.id,
              voteId: vote.id
            }
          );
          expect(updatedVoteWithMinister?.data?.updateVote).toHaveProperty('minister.id', minister.id);

          expect(mutationSpies.updateVote.calledOnce).toBeTruthy();
          expect(mutationSpies.updateMinister.notCalled).toBeTruthy();
        });
        test('UPDATE vote with nested CREATE minister', async () => {
          const ministerName = hacker.noun();
          const createdVote = await executeMutation(
            `
            mutation {
              createVote(data: {
                name: "vote1"
              })
              {
                id
                name
                minister {
                  id
                }
              }
            }
        `,
            {}
          );
          const vote = createdVote?.data?.createVote;
          expect(vote.minister).toBeFalsy();
          const updatedVoteWithMinister = await executeMutation(
            `
            mutation($name: String!, $voteId: ID!) {
              updateVote(
                where: { id: $voteId }
                data: {
                  name: "vote_1",
                  minister: { create: {name: $name}}
               }
              ) {
                id
                minister {
                  id
                  name
                }
              }
            }
        `,
            {
              name: ministerName,
              voteId: vote.id
            }
          );
          expect(updatedVoteWithMinister?.data?.updateVote).toHaveProperty('minister.id');
          expect(updatedVoteWithMinister?.data?.updateVote).toHaveProperty('minister.name', ministerName);

          expect(mutationSpies.updateVote.calledOnce).toBeTruthy();
          expect(mutationSpies.createMinister.calledOnce).toBeTruthy();
        });
        test('UPDATE vote with nested DISCONNECT minister', async () => {
          const voteNameValue = hacker.noun();
          const ministerNameValue = hacker.noun();
          const minister = await dataProvider.createEntity('Minister', {
            name: ministerNameValue
          });
          const vote = await dataProvider.createEntity('Vote', {
            name: voteNameValue,
            minister: {
              connect: {
                id: minister.id
              }
            }
          });

          const response = await executeMutation(
            `
              mutation($name: String!, 
                  $voteId: ID!) {
                updateVote(
                  data: {
                    name: $name
                    minister: { 
                      disconnect: true
                    }
                  }
                  where: {
                    id: $voteId
                  }
                ) {
                  name
                  minister {
                    name
                  }
                }
              }
            `,
            {
              name: voteNameValue,
              voteId: vote.id
            }
          );
          const updatedVote = response?.data?.updateVote;
          expect(updatedVote).toHaveProperty('name', voteNameValue);
          expect(updatedVote.minister).toBeNull();

          expect(mutationSpies.updateVote.calledOnce).toBeTruthy();
          expect(mutationSpies.updateMinister.notCalled).toBeTruthy();
        });
        test('UPDATE vote with nested DELETE minister', async () => {
          const voteNameValue = hacker.noun();
          const ministerNameValue = hacker.noun();
          const minister = await dataProvider.createEntity('Minister', {
            name: ministerNameValue
          });
          const vote = await dataProvider.createEntity('Vote', {
            name: voteNameValue,
            minister: {
              connect: {
                id: minister.id
              }
            }
          });
          const response = await executeMutation(
            `
              mutation($name: String!, 
                  $voteId: ID!) {
                updateVote(
                  data: {
                    name: $name
                    minister: { 
                      delete: true
                    }
                  }
                  where: {
                    id: $voteId
                  }
                ) {
                  name
                  minister {
                    name
                  }
                }
              }
            `,
            {
              name: voteNameValue,
              voteId: vote.id
            }
          );
          const updatedVote = response?.data?.updateVote;
          expect(updatedVote).toHaveProperty('name', voteNameValue);
          expect(updatedVote.minister).toBeNull();

          const fetchedDeletedMinister = await dataProvider.getEntity('Ministry', { id: minister.id });
          expect(fetchedDeletedMinister).toBeNull();

          expect(mutationSpies.updateVote.calledOnce).toBeTruthy();
          expect(mutationSpies.deleteMinister.calledOnce).toBeTruthy();
        });
      });
      describe('From Minister to Votes', () => {
        test('CREATE minister with nested CREATE vote', async () => {
          const ministerName = hacker.noun();
          const voteName = hacker.noun();
          const createdMinister = await executeMutation(
            `
          mutation ($ministerName: String!, $voteName: String!){
            createMinister(data: {
              name: $ministerName
              votes: {create: {name: $voteName}}
            })
            {
              id
              name
              votes {
                id
                name
              }
            }
          }
        `,
            {
              ministerName,
              voteName
            }
          );
          const minister = createdMinister?.data?.createMinister;
          expect(minister.votes).toHaveLength(1);
          expect(minister.votes[0]).toHaveProperty('name', voteName);

          expect(mutationSpies.createMinister.calledOnce).toBeTruthy();
          expect(mutationSpies.createVote.calledOnce).toBeTruthy();
        });
        test('CREATE minister with nested CONNECT vote', async () => {
          const voteName = hacker.noun();
          const createdVote = await executeMutation(
            `
          mutation ($voteName: String!){
            createVote(data: {
              name: $voteName
            })
            {
              id
              name
            }
          }
        `,
            { voteName }
          );
          const vote = createdVote?.data?.createVote;
          const ministerName = hacker.noun();
          const createdMinister = await executeMutation(
            `
          mutation ($ministerName: String!, $voteId: ID!){
            createMinister(data: {
              name: $ministerName
              votes: {connect: {id: $voteId}}
            })
            {
              id
              name
              votes {
                id
                name
              }
            }
          }
        `,
            {
              ministerName,
              voteId: vote.id
            }
          );
          const minister = createdMinister?.data?.createMinister;
          expect(minister.votes).toHaveLength(1);
          expect(minister.votes[0]).toMatchObject({ name: voteName, id: vote.id });

          expect(mutationSpies.createMinister.calledOnce).toBeTruthy();
          expect(mutationSpies.updateVote.notCalled).toBeTruthy();
        });
        test('UPDATE minister with nested CREATE vote', async () => {
          const ministerName = hacker.noun();
          const createdMinister = await executeMutation(
            `
          mutation ($ministerName: String!){
            createMinister(data: {
              name: $ministerName
            })
            {
              id
              name
              votes {
                id
                name
              }
            }
          }
        `,
            {
              ministerName
            }
          );
          const minister = createdMinister?.data?.createMinister;
          expect(minister.votes).toHaveLength(0);
          const voteName = hacker.noun();
          const updatedMinister = await executeMutation(
            `
          mutation ($ministerId: ID!, $voteName: String!){
            updateMinister(where: {id: $ministerId}
            data: { votes: {create: {name: $voteName}}
            })
            {
              id
              name
              votes {
                id
                name
              }
            }
          }
        `,
            {
              ministerId: minister.id,
              voteName
            }
          );
          const updatedMinisterData = updatedMinister?.data?.updateMinister;
          expect(updatedMinisterData.votes).toHaveLength(1);
          expect(updatedMinisterData.votes[0]).toHaveProperty('name', voteName);

          expect(mutationSpies.updateMinister.calledOnce).toBeTruthy();
          expect(mutationSpies.createVote.calledOnce).toBeTruthy();
        });
        test('UPDATE minister with nested CONNECT votes', async () => {
          const voteName = hacker.noun();
          const createdVote = await executeMutation(
            `
          mutation ($voteName: String!){
            createVote(data: {
              name: $voteName
            })
            {
              id
              name
            }
          }
        `,
            { voteName }
          );
          const vote = createdVote?.data?.createVote;
          const ministerName = hacker.noun();
          const createdMinister = await executeMutation(
            `
          mutation ($ministerName: String!){
            createMinister(data: {
              name: $ministerName
            })
            {
              id
              name
              votes {
                id
                name
              }
            }
          }
        `,
            {
              ministerName
            }
          );
          const minister = createdMinister?.data?.createMinister;
          expect(minister.votes).toHaveLength(0);
          const updatedMinister = await executeMutation(
            `
          mutation ($ministerId: ID!, $voteId: ID!){
            updateMinister(where: {id: $ministerId}
            data: { votes: {connect: {id: $voteId}}
            })
            {
              id
              name
              votes {
                id
                name
              }
            }
          }
        `,
            {
              ministerId: minister.id,
              voteId: vote.id
            }
          );
          const updatedMinisterData = updatedMinister?.data?.updateMinister;
          expect(updatedMinisterData.votes).toHaveLength(1);
          expect(updatedMinisterData.votes[0]).toMatchObject({ name: voteName, id: vote.id });

          expect(mutationSpies.updateMinister.calledOnce).toBeTruthy();
          expect(mutationSpies.updateVote.notCalled).toBeTruthy();
        });
        test('UPDATE minister with nested DISCONNECT vote', async () => {
          const voteNameValue = hacker.noun();
          const ministerNameValue = hacker.noun();
          const vote = await dataProvider.createEntity('Vote', {
            name: voteNameValue
          });
          const minister = await dataProvider.createEntity('Minister', {
            name: ministerNameValue,
            votes: {
              connect: {
                id: vote.id
              }
            }
          });

          const response = await executeMutation(
            `
              mutation($name: String!, $voteId: ID!, $ministerId: ID!) {
                updateMinister(
                  data: { name: $name, votes: { disconnect: { id: $voteId } } }
                  where: { id: $ministerId }
                ) {
                  name
                  votes {
                    id
                    name
                  }
                }
              }
            `,
            {
              name: voteNameValue,
              voteId: vote.id,
              ministerId: minister.id
            }
          );
          const updatedMinister = response?.data?.updateMinister;
          expect(updatedMinister).toHaveProperty('name', voteNameValue);
          expect(updatedMinister.votes).toHaveLength(0);

          expect(mutationSpies.updateMinister.calledOnce).toBeTruthy();
          expect(mutationSpies.updateVote.notCalled).toBeTruthy();
        });
        test('UPDATE minister with nested DELETE vote', async () => {
          const voteNameValue = hacker.noun();
          const ministerNameValue = hacker.noun();
          const vote = await dataProvider.createEntity('Vote', {
            name: voteNameValue
          });
          const minister = await dataProvider.createEntity('Minister', {
            name: ministerNameValue,
            votes: {
              connect: {
                id: vote.id
              }
            }
          });
          const response = await executeMutation(
            `
              mutation($name: String!, $voteId: ID!, $ministerId: ID!) {
                updateMinister(
                  data: { name: $name votes: { delete: { id: $voteId } } }
                  where: { id: $ministerId }
                ) {
                  name
                  votes {
                    id
                    name
                  }
                }
              }
            `,
            {
              name: voteNameValue,
              voteId: vote.id,
              ministerId: minister.id
            }
          );
          const updatedMinister = response?.data?.updateMinister;
          expect(updatedMinister).toHaveProperty('name', voteNameValue);
          expect(updatedMinister.votes).toHaveLength(0);

          const fetchedDeletedVote = await dataProvider.getEntity('Vote', { id: vote.id });
          expect(fetchedDeletedVote).toBeNull();

          expect(mutationSpies.updateMinister.calledOnce).toBeTruthy();
          expect(mutationSpies.deleteVote.called).toBeTruthy();
        });
      });
    });
  });

  describe('Nested mutation field is List', () => {
    describe('Relation owner is nested list', () => {
      test('CREATE Government with nested CREATE Ministry', async () => {
        const nameValue = hacker.noun();
        const response = await executeMutation(
          `
              mutation($name: String!) {
                createGovernment(
                  data: {
                    name: $name
                    ministries: { create: { name: $name } }
                  }
                ) {
                  name
                  ministries {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue
          }
        );
        const government = response?.data?.createGovernment;
        expect(government).toHaveProperty('name', nameValue);
        expect(government.ministries[0]).toHaveProperty('name', nameValue);

        expect(mutationSpies.createGovernment.calledOnce).toBeTruthy();
        expect(mutationSpies.createMinistry.calledOnce).toBeTruthy();
      });

      test('CREATE Government with nested CREATE multiple Ministries', async () => {
        const nameValue = hacker.noun();
        const anotherNameValue = hacker.noun();
        const response = await executeMutation(
          `
              mutation($name: String!, $anotherName: String!) {
                createGovernment(
                  data: {
                    name: $name
                    ministries: { create: [{ name: $name }, { name: $anotherName }] }
                  }
                ) {
                  name
                  ministries {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            anotherName: anotherNameValue
          }
        );
        const government = response?.data?.createGovernment;
        expect(government).toHaveProperty('name', nameValue);
        expect(government.ministries).toHaveLength(2);

        expect(mutationSpies.createGovernment.calledOnce).toBeTruthy();
        expect(mutationSpies.createMinistry.calledTwice).toBeTruthy();
      });

      test('CREATE Government with nested CONNECT Ministry', async () => {
        const nameValue = hacker.noun();
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameValue
        });

        const response = await executeMutation(
          `
              mutation($name: String!, $ministryId: ID!) {
                createGovernment(
                  data: {
                    name: $name
                    ministries: { connect: { id: $ministryId } }
                  }
                ) {
                  name
                  ministries {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministryId: ministry.id
          }
        );
        const government = response?.data?.createGovernment;
        expect(government).toHaveProperty('name', nameValue);
        expect(government.ministries[0]).toHaveProperty('name', nameValue);

        expect(mutationSpies.createGovernment.calledOnce).toBeTruthy();
        expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
      });

      test('UPDATE Government with nested CREATE Ministry', async () => {
        const nameInitialValue = hacker.noun();
        const nameValue = hacker.noun();
        const government = await dataProvider.createEntity('Government', {
          name: nameInitialValue
        });

        const response = await executeMutation(
          `
              mutation($name: String!, $governmentId: ID!) {
                updateGovernment(
                  data: {
                    name: $name
                    ministries: { create: { name: $name } }
                  }
                  where: {
                    id: $governmentId
                  }
                ) {
                  name
                  ministries {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            governmentId: government.id
          }
        );
        const updatedGovernment = response?.data?.updateGovernment;
        expect(updatedGovernment).toHaveProperty('name', nameValue);
        expect(updatedGovernment.ministries[0]).toHaveProperty('name', nameValue);

        expect(mutationSpies.updateGovernment.calledOnce).toBeTruthy();
        expect(mutationSpies.createMinistry.calledOnce).toBeTruthy();
      });

      test('UPDATE Government with nested CONNECT Ministry', async () => {
        const nameInitialValue = hacker.noun();
        const nameValue = hacker.noun();
        const government = await dataProvider.createEntity('Government', {
          name: nameInitialValue
        });
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue
        });

        const response = await executeMutation(
          `
              mutation($name: String!, 
                  $governmentId: ID!, 
                  $ministryId: ID!) {
                updateGovernment(
                  data: {
                    name: $name
                    ministries: { connect: { id: $ministryId } }
                  }
                  where: {
                    id: $governmentId
                  }
                ) {
                  name
                  ministries {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            governmentId: government.id,
            ministryId: ministry.id
          }
        );
        const updatedGovernment = response?.data?.updateGovernment;
        expect(updatedGovernment).toHaveProperty('name', nameValue);
        expect(updatedGovernment.ministries[0]).toHaveProperty('name', nameInitialValue);

        expect(mutationSpies.updateGovernment.calledOnce).toBeTruthy();
        expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
      });

      test('UPDATE Government with nested CONNECT multiple Ministries', async () => {
        const nameInitialValue = hacker.noun();
        const nameValue = hacker.noun();
        const government = await dataProvider.createEntity('Government', {
          name: nameInitialValue
        });
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue
        });
        const anotherMinistry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue
        });

        const response = await executeMutation(
          `
              mutation($name: String!, 
                  $governmentId: ID!, 
                  $anotherMinistryId: ID!, 
                  $ministryId: ID!) {
                updateGovernment(
                  data: {
                    name: $name
                    ministries: { connect: [{ id: $ministryId }, { id: $anotherMinistryId }] }
                  }
                  where: {
                    id: $governmentId
                  }
                ) {
                  name
                  ministries {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            governmentId: government.id,
            ministryId: ministry.id,
            anotherMinistryId: anotherMinistry.id
          }
        );
        const updatedGovernment = response?.data?.updateGovernment;
        expect(updatedGovernment.ministries[0]).toHaveProperty('name', nameInitialValue);
        expect(updatedGovernment.ministries[1]).toHaveProperty('name', nameInitialValue);

        expect(mutationSpies.updateGovernment.calledOnce).toBeTruthy();
        expect(mutationSpies.updateMinistry.calledTwice).toBeTruthy();
      });

      test('UPDATE Government with nested UPDATE Ministry', async () => {
        const nameInitialValue = hacker.noun();
        const nameValue = hacker.noun();

        const government = await dataProvider.createEntity('Government', {
          name: nameInitialValue
        });
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue,
          government: {
            connect: {
              id: government.id
            }
          }
        });
        const anotherMinistry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue,
          government: {
            connect: {
              id: government.id
            }
          }
        });

        const response = await executeMutation(
          `
              mutation(
                $name: String!
                $governmentId: ID!
                $ministryId: ID!
              ) {
                updateGovernment(
                  data: {
                    name: $name
                    ministries: {
                      update: {
                        data: { name: $name }
                        where: { id: $ministryId }
                      }
                    }
                  }
                  where: { id: $governmentId }
                ) {
                  name
                  ministries {
                    id
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministryId: ministry.id,
            governmentId: government.id
          }
        );
        const updatedGovernment = response?.data?.updateGovernment;
        expect(updatedGovernment).toHaveProperty('name', nameValue);
        expect(updatedGovernment.ministries).toHaveLength(2);
        expect(updatedGovernment.ministries.find(e => e.id === ministry.id)).toHaveProperty('name', nameValue);
        expect(updatedGovernment.ministries.find(e => e.id === anotherMinistry.id)).toHaveProperty('name', nameInitialValue);

        expect(mutationSpies.updateGovernment.calledOnce).toBeTruthy();
        expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
      });

      test('UPDATE Government with nested DISCONNECT Ministry', async () => {
        const nameInitialValue = hacker.noun();
        const nameValue = hacker.noun();
        const government = await dataProvider.createEntity('Government', {
          name: nameInitialValue
        });
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue,
          government: {
            connect: {
              id: government.id
            }
          }
        });

        const response = await executeMutation(
          `
              mutation(
                $name: String!
                $governmentId: ID!
                $ministryId: ID!
              ) {
                updateGovernment(
                  data: {
                    name: $name
                    ministries: { disconnect: { id: $ministryId } }
                  }
                  where: { id: $governmentId }
                ) {
                  name
                  ministries {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            ministryId: ministry.id,
            governmentId: government.id
          }
        );
        const updatedGovernment = response?.data?.updateGovernment;
        expect(updatedGovernment).toHaveProperty('name', nameValue);
        expect(updatedGovernment.ministries).toHaveLength(0);

        expect(mutationSpies.updateGovernment.calledOnce).toBeTruthy();
        expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
      });

      test('UPDATE Government with nested DELETE Ministries', async () => {
        const nameInitialValue = hacker.noun();
        const nameValue = hacker.noun();

        const government = await dataProvider.createEntity('Government', {
          name: nameInitialValue
        });
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue,
          government: {
            connect: {
              id: government.id
            }
          }
        });
        const anotherMinistry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue,
          government: {
            connect: {
              id: government.id
            }
          }
        });
        const yetAnotherMinistry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue
        });

        const ministries = await dataProvider.getAllEntities('Ministry', {
          where: { id_in: [ministry.id, anotherMinistry.id, yetAnotherMinistry.id] }
        });
        expect(ministries).toHaveLength(3);

        const response = await executeMutation(
          `
              mutation(
                $name: String!
                $governmentId: ID!
                $nameInitialValue: String
              ) {
                updateGovernment(
                  data: {
                    name: $name
                    ministries: { deleteMany: { name: $nameInitialValue } }
                  }
                  where: { id: $governmentId }
                ) {
                  name
                  ministries {
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            nameInitialValue,
            governmentId: government.id
          }
        );
        const updatedGovernment = response?.data?.updateGovernment;
        expect(updatedGovernment).toHaveProperty('name', nameValue);
        const ministriesAfterDelete = await dataProvider.getAllEntities('Ministry', {
          where: { id_in: [ministry.id, anotherMinistry.id, yetAnotherMinistry.id] }
        });

        expect(ministriesAfterDelete).toHaveLength(1);

        expect(mutationSpies.updateGovernment.calledOnce).toBeTruthy();
        expect(mutationSpies.deleteMinistry.calledTwice).toBeTruthy();
      });

      test('UPDATE Government with nested UPDATE_MANY Ministry', async () => {
        const nameInitialValue = hacker.noun();
        const nameInitialLongValue = hacker.noun() + hacker.phrase();
        const nameValue = hacker.noun();

        const government = await dataProvider.createEntity('Government', {
          name: nameInitialValue
        });
        const ministry = await dataProvider.createEntity('Ministry', {
          name: nameInitialLongValue,
          government: {
            connect: {
              id: government.id
            }
          }
        });
        const anotherMinistry = await dataProvider.createEntity('Ministry', {
          name: nameInitialValue,
          government: {
            connect: {
              id: government.id
            }
          }
        });
        const yetAnotherMinistry = await dataProvider.createEntity('Ministry', {
          name: nameInitialLongValue,
          government: {
            connect: {
              id: government.id
            }
          }
        });

        const response = await executeMutation(
          `
              mutation(
                $name: String!
                $governmentId: ID!
                $nameInitialLongValue: String!
                $anotherMinistryId: ID!
              ) {
                updateGovernment(
                  data: {
                    name: $name
                    ministries: {
                      updateMany: [
                        { data: { name: $name }, where: { name: $nameInitialLongValue } }
                        { data: { name: $name }, where: { id: $anotherMinistryId } }
                      ]
                    }
                  }
                  where: { id: $governmentId }
                ) {
                  name
                  ministries {
                    id
                    name
                  }
                }
              }
            `,
          {
            name: nameValue,
            nameInitialLongValue,
            anotherMinistryId: anotherMinistry.id,
            governmentId: government.id
          }
        );
        const updatedGovernment = response?.data?.updateGovernment;
        expect(updatedGovernment).toHaveProperty('name', nameValue);
        expect(updatedGovernment.ministries).toHaveLength(3);
        expect(updatedGovernment.ministries.find(e => e.id === ministry.id)).toHaveProperty('name', nameValue);
        expect(updatedGovernment.ministries.find(e => e.id === anotherMinistry.id)).toHaveProperty('name', nameValue);
        expect(updatedGovernment.ministries.find(e => e.id === yetAnotherMinistry.id)).toHaveProperty('name', nameValue);
      });
    });

    describe('Set operation', () => {
      test('should create ministry with list of domains', async () => {
        const nameValue = hacker.noun();
        const domains = ['schools', 'college'];
        const response = await executeMutation(
          `
              mutation($name: String!, $domains: [String!]!) {
                createMinistry(
                  data: {
                    name: $name
                    domains: {set: $domains}
                  }
                ) {
                  id
                  name
                  domains
                }
              }
            `,
          {
            name: nameValue,
            domains
          }
        );
        const createdMinistry = response?.data?.createMinistry;
        expect(createdMinistry).toHaveProperty('domains', domains);
      });
      test('should update ministry with list of domains', async () => {
        const name = hacker.noun();
        const initialDomains = ['school', 'college'];
        const ministry = await dataProvider.createEntity('Ministry', {
          name,
          domains: initialDomains
        });
        const updatedDomains = ['university'];
        let response = await executeMutation(
          `
              mutation($ministryId: ID!, $domains: [String!]!) {
                updateMinistry(
                  data: {
                    domains: {set: $domains}
                  }
                  where: { id: $ministryId}
                ) {
                  id
                  domains
                }
              }
            `,
          {
            domains: updatedDomains,
            ministryId: ministry.id
          }
        );
        const updatedMinistry = response?.data?.updateMinistry;
        expect(updatedMinistry).toHaveProperty('domains', updatedDomains);

        response = await executeMutation(
          `
              query($ministryId: ID!) {
                ministry(
                  where: { id: $ministryId}
                ) {
                  id
                  domains
                }
              }
            `,
          {
            ministryId: ministry.id
          }
        );
        const fetchedMinistry = response?.data?.ministry;
        expect(fetchedMinistry).toHaveProperty('domains', updatedDomains);
      });

      test('should update ministry with empty list of domains', async () => {
        const name = hacker.noun();
        const initialDomains = ['school', 'college'];
        const ministry = await dataProvider.createEntity('Ministry', {
          name,
          domains: initialDomains
        });
        const updatedDomains: any = [];
        let response = await executeMutation(
          `
              mutation($ministryId: ID!, $domains: [String!]!) {
                updateMinistry(
                  data: {
                    domains: {set: $domains}
                  }
                  where: { id: $ministryId}
                ) {
                  id
                  domains
                }
              }
            `,
          {
            domains: updatedDomains,
            ministryId: ministry.id
          }
        );
        const updatedMinistry = response?.data?.updateMinistry;
        expect(updatedMinistry).toHaveProperty('domains', updatedDomains);

        response = await executeMutation(
          `
              query($ministryId: ID!) {
                ministry(
                  where: { id: $ministryId}
                ) {
                  id
                  domains
                }
              }
            `,
          {
            ministryId: ministry.id
          }
        );
        const fetchedMinistry = response?.data?.ministry;
        expect(fetchedMinistry).toHaveProperty('domains', updatedDomains);
      });
    });
  });

  describe('Nesting of multiple levels deep', () => {
    test('UPDATE Minister with nested UPDATE Ministry with nested CREATE Government', async () => {
      const nameValue = hacker.noun();
      const minister = await dataProvider.createEntity('Minister', {
        name: nameValue
      });
      await dataProvider.createEntity('Ministry', {
        name: nameValue,
        minister: {
          connect: {
            id: minister.id
          }
        }
      });

      const response = await executeMutation(
        `
              mutation($name: String!, 
                  $ministerId: ID!) {
                updateMinister(
                  data: {
                    name: $name
                    ministry: { 
                      update: { 
                        name: $name
                        government: {
                          create: {
                            name: $name
                          }
                        }
                      } 
                    }
                  }
                  where: {
                    id: $ministerId
                  }
                ) {
                  name
                  ministry {
                    name
                    government {
                      name
                    }
                  }
                }
              }
            `,
        {
          name: nameValue,
          ministerId: minister.id
        }
      );
      const updatedMinister = response?.data?.updateMinister;
      expect(updatedMinister).toHaveProperty('name', nameValue);
      expect(updatedMinister.ministry).toHaveProperty('name', nameValue);
      expect(updatedMinister.ministry.government).toHaveProperty('name', nameValue);

      expect(mutationSpies.updateMinister.calledOnce).toBeTruthy();
      expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
      expect(mutationSpies.createGovernment.calledOnce).toBeTruthy();
    });

    test('UPDATE Minister with nested UPDATE Ministry with nested disconnect Government', async () => {
      const nameValue = hacker.noun();
      const minister = await dataProvider.createEntity('Minister', {
        name: nameValue
      });
      const ministry = await dataProvider.createEntity('Ministry', {
        name: nameValue,
        minister: {
          connect: {
            id: minister.id
          }
        }
      });
      await dataProvider.createEntity('Government', {
        name: nameValue,
        ministries: {
          connect: [{ id: ministry.id }]
        }
      });

      const response = await executeMutation(
        `
              mutation($name: String!, 
                  $ministerId: ID!) {
                updateMinister(
                  data: {
                    name: $name
                    ministry: { 
                      update: { 
                        name: $name
                        government: {
                          disconnect: true
                        }
                      } 
                    }
                  }
                  where: {
                    id: $ministerId
                  }
                ) {
                  name
                  ministry {
                    name
                    government {
                      name
                    }
                  }
                }
              }
            `,
        {
          name: nameValue,
          ministerId: minister.id
        }
      );
      const updatedMinister = response?.data?.updateMinister;
      expect(updatedMinister).toHaveProperty('name', nameValue);
      expect(updatedMinister.ministry).toHaveProperty('name', nameValue);
      expect(updatedMinister.ministry.government).toBeNull();

      expect(mutationSpies.updateMinister.calledOnce).toBeTruthy();
      expect(mutationSpies.updateMinistry.calledOnce).toBeTruthy();
    });
  });

  describe('Unsupported operations', () => {
    test('No UPSERTs are supported - e.g. UPDATE Government with nested Ministry UPSERT', async () => {
      const nameInitialValue = hacker.noun();
      const nameValue = hacker.noun();
      const ministry = await dataProvider.createEntity('Ministry', {
        name: nameInitialValue
      });
      const anotherMinistry = await dataProvider.createEntity('Ministry', {
        name: nameInitialValue
      });
      const government = await dataProvider.createEntity('Government', {
        name: nameInitialValue,
        ministries: {
          connect: [{ id: ministry.id }, { id: anotherMinistry.id }]
        }
      });

      const mutationWithUpsertResponse = await executeMutation(
        `
              mutation(
                $name: String!
                $governmentId: ID!
                $ministryId: ID!
              ) {
                updateGovernment(
                  data: {
                    name: $name
                    ministries: {
                      upsert: {
                        update: {
                          name: $name
                        }
                        create: {
                          name: $name
                        }
                        where: { id: $ministryId }
                      }
                    }
                  }
                  where: { id: $governmentId }
                ) {
                  name
                  ministries {
                    id
                    name
                  }
                }
              }
            `,
        {
          name: nameValue,
          ministryId: ministry.id,
          governmentId: government.id
        }
      );
      // @ts-ignore
      expect(mutationWithUpsertResponse.errors[0]).toHaveProperty('message', 'Nested upsert actions are not supported');
    });
  });
});

async function executeMutation(mutation, variables) {
  return mutate({ mutation, variables });
}

function createMutationSpies() {
  const entities = ['Government', 'Ministry', 'Minister', 'Vote'];
  const mutationTypes = ['create', 'update', 'delete'];
  const spies: any = {};
  entities.forEach(entity => {
    mutationTypes.forEach(mutationType => {
      const mutationName = `${mutationType}${entity}`;
      // @ts-ignore
      spies[mutationName] = sinon.spy(resolvers.Mutation, mutationName);
    });
  });
  return spies;
}
