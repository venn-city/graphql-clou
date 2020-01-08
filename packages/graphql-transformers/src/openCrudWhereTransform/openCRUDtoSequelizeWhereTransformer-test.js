const sequelizeModel = require('@venncity/sequelize-model');
const { Op } = require('sequelize');
const { openCrudToSequelize } = require('./openCRUDtoSequelizeWhereTransformer');
const models = require('./../../../../test/model');

const sq = sequelizeModel.sq.init(models);

describe('openCRUDtoSequelizeWhereTransformer', () => {
  describe('openCrudToSequelize should transform graphql openCRUD { where, first, skip, orderBy } to sequelize', () => {
    test('should transform first to "limit" and skip to "offset"', () => {
      const sqFilter = openCrudToSequelize({ where: { name: 'mu' }, first: 15, skip: 7 }, 'Government', ['Government']);
      expect(sqFilter).toHaveProperty('where', { [Op.and]: [{ name: 'mu' }] });
      expect(sqFilter).toHaveProperty('limit', 15);
      expect(sqFilter).toHaveProperty('offset', 7);
    });

    test('should transform orderBy to order', () => {
      const sqFilter = openCrudToSequelize({ where: { name_not: 'mu' }, orderBy: 'name_DESC' }, 'Government', ['Government']);
      expect(sqFilter).toHaveProperty('where', { [Op.and]: [{ name: { [Op.not]: 'mu' } }] });
      expect(sqFilter).toHaveProperty('order', [['name', 'DESC']]);
    });
  });

  describe('openCrudToSequelize should transform graphql openCRUD where clause to sequelize where clause', () => {
    describe('scalar field transformations', () => {
      test('not', () => {
        const sqFilter = openCrudToSequelize({ where: { name_not: 'mu' } }, 'Government');
        expect(sqFilter).toHaveProperty('where', { [Op.and]: [{ name: { [Op.not]: 'mu' } }] });
      });

      test('in', () => {
        const sqFilterForArray = openCrudToSequelize({ where: { name_in: ['mu', 'ko'] } }, 'Government');
        expect(sqFilterForArray).toHaveProperty('where', { [Op.and]: [{ name: { [Op.in]: ['mu', 'ko'] } }] });

        const sqFilterSingleValue = openCrudToSequelize({ where: { name_in: 'ko' } }, 'Government');
        expect(sqFilterSingleValue).toHaveProperty('where', { [Op.and]: [{ name: { [Op.in]: ['ko'] } }] });
      });

      test('not_in', () => {
        const sqFilterForArray = openCrudToSequelize({ where: { name_not_in: ['mu', 'ko'] } }, 'Government');
        expect(sqFilterForArray).toHaveProperty('where', { [Op.and]: [{ name: { [Op.notIn]: ['mu', 'ko'] } }] });

        const sqFilterSingleValue = openCrudToSequelize({ where: { name_not_in: 'ko' } }, 'Government');
        expect(sqFilterSingleValue).toHaveProperty('where', { [Op.and]: [{ name: { [Op.notIn]: ['ko'] } }] });
      });

      test('lt', () => {
        const sqFilter = openCrudToSequelize({ where: { name_lt: 'mu' } }, 'Government');
        expect(sqFilter).toHaveProperty('where', { [Op.and]: [{ name: { [Op.lt]: 'mu' } }] });
      });

      test('lte', () => {
        const sqFilter = openCrudToSequelize({ where: { name_lte: 'mu' } }, 'Government');
        expect(sqFilter).toHaveProperty('where', { [Op.and]: [{ name: { [Op.lte]: 'mu' } }] });
      });

      test('gt', () => {
        const sqFilter = openCrudToSequelize({ where: { name_gt: 'mu' } }, 'Government');
        expect(sqFilter).toHaveProperty('where', { [Op.and]: [{ name: { [Op.gt]: 'mu' } }] });
      });

      test('gte', () => {
        const sqFilter = openCrudToSequelize({ where: { name_gte: 'mu' } }, 'Government');
        expect(sqFilter).toHaveProperty('where', { [Op.and]: [{ name: { [Op.gte]: 'mu' } }] });
      });

      test('contains', () => {
        const sqFilter = openCrudToSequelize({ where: { name_contains: 'mu' } }, 'Government');
        expect(sqFilter).toHaveProperty('where', { [Op.and]: [{ name: { [Op.like]: '%mu%' } }] });
      });

      test('not_contains', () => {
        const sqFilter = openCrudToSequelize({ where: { name_not_contains: 'mu' } }, 'Government');
        expect(sqFilter).toHaveProperty('where', { [Op.and]: [{ name: { [Op.notLike]: '%mu%' } }] });
      });

      test('starts_with', () => {
        const sqFilter = openCrudToSequelize({ where: { name_starts_with: 'mu' } }, 'Government');
        expect(sqFilter).toHaveProperty('where', { [Op.and]: [{ name: { [Op.like]: 'mu%' } }] });
      });

      test('not_starts_with', () => {
        const sqFilter = openCrudToSequelize({ where: { name_not_starts_with: 'mu' } }, 'Government');
        expect(sqFilter).toHaveProperty('where', { [Op.and]: [{ name: { [Op.notLike]: 'mu%' } }] });
      });

      test('ends_with', () => {
        const sqFilter = openCrudToSequelize({ where: { name_ends_with: 'mu' } }, 'Government');
        expect(sqFilter).toHaveProperty('where', { [Op.and]: [{ name: { [Op.like]: '%mu' } }] });
      });

      test('not_starts_with', () => {
        const sqFilter = openCrudToSequelize({ where: { name_not_ends_with: 'mu' } }, 'Government');
        expect(sqFilter).toHaveProperty('where', { [Op.and]: [{ name: { [Op.notLike]: '%mu' } }] });
      });
    });

    describe('combined transformations', () => {
      test('boolean operators and relations', () => {
        const sqFilter = openCrudToSequelize(
          { where: { AND: [{ name: 'ko' }, { name_not: 'mu' }, { ministries_none: { name: 'py' } }] } },
          'Government'
        );
        expect(sqFilter).toHaveProperty('where', {
          [Op.and]: [
            {
              [Op.and]: [
                {
                  [Op.and]: [{ name: 'ko' }]
                },
                {
                  [Op.and]: [{ name: { [Op.not]: 'mu' } }]
                },
                {
                  [Op.and]: [
                    {
                      id: {
                        [Op.ne]: {
                          [Op.all]: {
                            val:
                              'SELECT "government_id" FROM "venn"."ministries" AS "Ministry" WHERE ((("Ministry"."name" = \'py\')) ' +
                              'AND "Ministry"."government_id" = "Government"."id")'
                          }
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        });
        expect(sqFilter).toHaveProperty('include', [
          {
            model: sq.Ministry,
            as: 'ministries',
            required: false,
            attributes: []
          }
        ]);
      });
    });

    describe('boolean operator transformations', () => {
      test('AND', () => {
        const sqFilter = openCrudToSequelize({ where: { AND: [{ name: 'ko' }, { name_not: 'mu' }] } }, 'Government');
        expect(sqFilter).toHaveProperty('where', {
          [Op.and]: [
            {
              [Op.and]: [
                {
                  [Op.and]: [{ name: 'ko' }]
                },
                {
                  [Op.and]: [{ name: { [Op.not]: 'mu' } }]
                }
              ]
            }
          ]
        });
      });

      test('OR', () => {
        const sqFilter = openCrudToSequelize({ where: { OR: [{ name: 'ko' }, { name_not: 'mu' }] } }, 'Government');
        expect(sqFilter).toHaveProperty('where', {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  [Op.and]: [{ name: 'ko' }]
                },
                {
                  [Op.and]: [{ name: { [Op.not]: 'mu' } }]
                }
              ]
            }
          ]
        });
      });

      test('NOT', () => {
        const sqFilter = openCrudToSequelize({ where: { NOT: [{ name: 'ko' }] } }, 'Government');
        expect(sqFilter).toHaveProperty('where', {
          [Op.and]: [
            {
              [Op.not]: {
                [Op.and]: [
                  {
                    [Op.and]: [{ name: 'ko' }]
                  }
                ]
              }
            }
          ]
        });
      });
    });

    describe('relation transformation', () => {
      describe('single relation', () => {
        test('single relation from the referenced entity', () => {
          const sqFilter = openCrudToSequelize({ where: { minister: { name: 'ku' } } }, 'Ministry');
          expect(sqFilter).toHaveProperty('where', {
            [Op.and]: [
              {
                [Op.and]: [
                  {
                    '$minister.name$': 'ku'
                  }
                ]
              }
            ]
          });
          expect(sqFilter).toHaveProperty('include', [
            {
              model: sq.Minister,
              as: 'minister',
              required: false,
              include: [],
              attributes: []
            }
          ]);
        });

        test('single relation from the referencing entity', () => {
          const sqFilter = openCrudToSequelize({ where: { ministry: { name: 'ku' } } }, 'Minister');
          expect(sqFilter).toHaveProperty('where', {
            [Op.and]: [
              {
                [Op.and]: [
                  {
                    '$ministry.name$': 'ku'
                  }
                ]
              }
            ]
          });
          expect(sqFilter).toHaveProperty('include', [
            {
              model: sq.Ministry,
              as: 'ministry',
              required: false,
              include: [],
              attributes: []
            }
          ]);
        });

        test('single relation from a join-table referenced entity', () => {
          const sqFilter = openCrudToSequelize({ where: { minister: { name: 'ku' } } }, 'Vote');
          expect(sqFilter).toHaveProperty('where', {
            [Op.and]: [
              {
                [Op.and]: [
                  {
                    '$minister.name$': 'ku'
                  }
                ]
              }
            ]
          });
          expect(sqFilter).toHaveProperty('include', [
            {
              model: sq.Minister,
              as: 'minister',
              required: false,
              duplicating: false,
              include: [],
              attributes: []
            }
          ]);
        });
      });

      describe('many relation on "hasMany" relation', () => {
        test('"some" condition on "hasMany" many relation ', () => {
          const sqFilter = openCrudToSequelize({ where: { ministries_some: { name: 'ku' } } }, 'Government');
          expect(sqFilter).toHaveProperty('where', {
            [Op.and]: [
              {
                [Op.and]: [
                  {
                    '$ministries.name$': 'ku'
                  }
                ]
              }
            ]
          });
          expect(sqFilter).toHaveProperty('include', [
            {
              model: sq.Ministry,
              as: 'ministries',
              required: false,
              duplicating: false,
              include: [],
              attributes: []
            }
          ]);
        });

        test('"every" condition on "hasMany" many relation ', () => {
          const sqFilter = openCrudToSequelize({ where: { ministries_every: { name: 'ku' } } }, 'Government');
          expect(sqFilter).toHaveProperty('where', {
            [Op.and]: [
              {
                id: {
                  [Op.ne]: {
                    [Op.all]: {
                      val:
                        'SELECT "government_id" FROM "venn"."ministries" AS "Ministry" WHERE (NOT (("Ministry"."name" = \'ku\')) ' +
                        'AND "Ministry"."government_id" = "Government"."id")'
                    }
                  }
                }
              }
            ]
          });
          expect(sqFilter).toHaveProperty('include', [
            {
              model: sq.Ministry,
              as: 'ministries',
              required: false,
              attributes: []
            }
          ]);
        });

        test('"none" condition on "hasMany" many relation ', () => {
          const sqFilter = openCrudToSequelize({ where: { ministries_none: { name: 'ku' } } }, 'Government');
          expect(sqFilter).toHaveProperty('where', {
            [Op.and]: [
              {
                id: {
                  [Op.ne]: {
                    [Op.all]: {
                      val:
                        'SELECT "government_id" FROM "venn"."ministries" AS "Ministry" WHERE ((("Ministry"."name" = \'ku\')) ' +
                        'AND "Ministry"."government_id" = "Government"."id")'
                    }
                  }
                }
              }
            ]
          });
          expect(sqFilter).toHaveProperty('include', [
            {
              model: sq.Ministry,
              as: 'ministries',
              required: false,
              attributes: []
            }
          ]);
        });
      });

      describe('many relation on "belongsToMany" relation', () => {
        test('"some" condition on "belongsToMany" many relation ', () => {
          const sqFilter = openCrudToSequelize({ where: { votes_some: { name: 'ku' } } }, 'Minister');
          expect(sqFilter).toHaveProperty('where', {
            [Op.and]: [
              {
                [Op.and]: [
                  {
                    '$votes.name$': 'ku'
                  }
                ]
              }
            ]
          });
          expect(sqFilter).toHaveProperty('include', [
            {
              model: sq.Vote,
              as: 'votes',
              required: false,
              duplicating: false,
              include: [],
              attributes: []
            }
          ]);
        });

        test('"every" condition on "belongsToMany" many relation ', () => {
          const sqFilter = openCrudToSequelize({ where: { votes_every: { name: 'ku' } } }, 'Minister');
          expect(sqFilter).toHaveProperty('where', {
            [Op.and]: [
              {
                id: {
                  [Op.ne]: {
                    [Op.all]: {
                      val:
                        'SELECT "Minister"."id" FROM "venn"."ministers" AS "Minister" INNER JOIN ' +
                        '( "venn"."ministers_votes_join_table" AS "votes->ministersvotes" INNER JOIN ' +
                        '"venn"."votes" AS "votes" ON "votes"."id" = "votes->ministersvotes"."vote_id") ON ' +
                        '"Minister"."id" = "votes->ministersvotes"."minister_id" AND NOT (("votes"."name" = \'ku\'))'
                    }
                  }
                }
              }
            ]
          });
          expect(sqFilter).toHaveProperty('include', [
            {
              model: sq.Vote,
              as: 'votes',
              required: false,
              attributes: []
            }
          ]);
        });

        test('"none" condition on "belongsToMany" many relation ', () => {
          const sqFilter = openCrudToSequelize({ where: { votes_none: { name: 'ku' } } }, 'Minister');
          expect(sqFilter).toHaveProperty('where', {
            [Op.and]: [
              {
                id: {
                  [Op.ne]: {
                    [Op.all]: {
                      val:
                        'SELECT "Minister"."id" FROM "venn"."ministers" AS "Minister" INNER JOIN ' +
                        '( "venn"."ministers_votes_join_table" AS "votes->ministersvotes" INNER JOIN ' +
                        '"venn"."votes" AS "votes" ON "votes"."id" = "votes->ministersvotes"."vote_id") ON ' +
                        '"Minister"."id" = "votes->ministersvotes"."minister_id" AND (("votes"."name" = \'ku\'))'
                    }
                  }
                }
              }
            ]
          });
          expect(sqFilter).toHaveProperty('include', [
            {
              model: sq.Vote,
              as: 'votes',
              required: false,
              attributes: []
            }
          ]);
        });
      });
    });
  });

  describe('transformation errors', () => {
    test('general error', () => {
      expect(() => openCrudToSequelize({ where: { i_made_up_this_field: 'ty' } })).toThrowError({
        message: "Cannot read property 'getFields' of undefined"
      });
    });

    test('field name error', () => {
      expect(() => openCrudToSequelize({ where: { name_foo: 'ty' } }, 'Government')).toThrowError({
        message: 'Unsupported where conditions, {"name_foo":"ty"}'
      });
    });

    test('field ministries_every error', () => {
      expect(() => openCrudToSequelize({ where: { ministries_boom: { name: 'ty' } } }, 'Government')).toThrowError({
        message: 'Unsupported many-relation where conditions, {"ministries_boom":{"name":"ty"}}'
      });
    });
  });
});
