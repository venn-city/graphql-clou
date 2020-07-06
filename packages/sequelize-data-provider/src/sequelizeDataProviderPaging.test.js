"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-vars */
var faker_1 = require("faker");
var lodash_1 = require("lodash");
var sequelize_model_1 = __importDefault(require("@venncity/sequelize-model"));
var sequelizeDataProvider_1 = __importDefault(require("./sequelizeDataProvider"));
var model_1 = __importDefault(require("../../../test/model"));
sequelize_model_1.default.sq.init(model_1.default);
describe('sequelizeDataProvider paging tests', function () {
    /**
  
     +------------+                                 +--------------+
     |Government1 +-------------------------+       |Government2   |
     | Atlantis   +-------+                 |       | Sorcha       |
     | 9500BC     |       |                 |       | 1964         |
     +-----+------+       |                 |       +--------------+
           |              |                 |
           |              |                 |
     +-----+----+   +-----+----+     +------+-----+
     |Ministry1 |   |Ministry2 |     |Ministry3   |
     | Finance  |   | Defence  |     | Healthcare |
     | 87       |   | 22.1     |     | 22.1       |
     +----------+   +----------+     +------------+
           |             |
           |             |
           |             |
     +-----+----+   +----------+                     +-------------+
     |Minister1 |   |Minister2 +-----------+         |Minister3    |
     | Lazaros  |   | Natassas |           |         | Vasileia    |
     +----------+   +----------+   +-------+-----+   +-------------+
         |               |         |Vote3        |
         |               |         | Raise taxes |  +--------------+
         |               |         | Nay         |  |Vote4         |
     +---+--------+      |         +-------------+  | Make war     |
     |Vote1       |      |                          | Abstain      |
     | Build walls|  +---+--------+                 +--------------+
     | Yea        |  |Vote2       |
     +------------+  | Build walls|
                     | Nay        |
                     +------------+
     */
    // Sometimes both testsuits generate the same random number and test data collide
    // Adding 123 makes sure data is not intersecting between testsuites
    var randomNumber = faker_1.random.number() + 123;
    var government1;
    var governmentName1 = "9500BC" + randomNumber;
    var governmentCountry1 = "Atlantis" + randomNumber;
    var governmentName2 = "1966" + randomNumber;
    var governmentCountry2 = "Sorcha" + randomNumber;
    var ministryName1 = "Finance" + randomNumber;
    var ministryBudget1 = 87 + randomNumber;
    var ministryName2 = "Defence" + randomNumber;
    var ministryBudget2 = 22.1 + randomNumber;
    var ministryName3 = "Healthcare" + randomNumber;
    var ministryBudget3 = 22.1 + randomNumber;
    var minister1;
    var ministerName1 = "Lazaros" + randomNumber;
    var minister2;
    var ministerName2 = "Natassas" + randomNumber;
    var ministerName3 = "Vasileia" + randomNumber;
    var voteName1 = "Build walls" + randomNumber;
    var voteBallot1 = 'YEA';
    var voteName2 = "Build walls" + randomNumber;
    var voteBallot2 = 'NAY';
    var voteName3 = "Raise taxes" + randomNumber;
    var voteBallot3 = 'NAY';
    var voteName4 = "Make war" + randomNumber;
    var voteBallot4 = 'ABSTAIN';
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.info('random seed', randomNumber);
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Government', { name: governmentName1, country: governmentCountry1 })];
                case 1:
                    government1 = _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Government', { name: governmentName2, country: governmentCountry2 })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Minister', {
                            name: ministerName1
                        })];
                case 3:
                    minister1 = _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Minister', {
                            name: ministerName2
                        })];
                case 4:
                    minister2 = _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Minister', {
                            name: ministerName3
                        })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Ministry', {
                            name: ministryName1,
                            budget: ministryBudget1,
                            government: {
                                connect: {
                                    id: government1.id
                                }
                            },
                            minister: {
                                connect: {
                                    id: minister1.id
                                }
                            }
                        })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Ministry', {
                            name: ministryName2,
                            budget: ministryBudget2,
                            government: {
                                connect: {
                                    id: government1.id
                                }
                            },
                            minister: {
                                connect: {
                                    id: minister2.id
                                }
                            }
                        })];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Ministry', {
                            name: ministryName3,
                            budget: ministryBudget3,
                            government: {
                                connect: {
                                    id: government1.id
                                }
                            }
                        })];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Vote', {
                            name: voteName1,
                            ballot: voteBallot1,
                            minister: {
                                connect: {
                                    id: minister1.id
                                }
                            }
                        })];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Vote', {
                            name: voteName2,
                            ballot: voteBallot2,
                            minister: {
                                connect: {
                                    id: minister2.id
                                }
                            }
                        })];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Vote', {
                            name: voteName3,
                            ballot: voteBallot3,
                            minister: {
                                connect: {
                                    id: minister2.id
                                }
                            }
                        })];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Vote', {
                            name: voteName4,
                            ballot: voteBallot4
                        })];
                case 12:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            sequelize_model_1.default.sq.sequelize.close();
            return [2 /*return*/];
        });
    }); });
    test('getAllEntities with nested _every and _none filters', function () { return __awaiter(void 0, void 0, void 0, function () {
        var i, createdGovernment, ministries, j, createdMinistry, fetchedGovernments;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 5)) return [3 /*break*/, 7];
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Government', {
                            name: "" + governmentName1 + i
                        })];
                case 2:
                    createdGovernment = _a.sent();
                    ministries = [];
                    j = 0;
                    _a.label = 3;
                case 3:
                    if (!(j < 3)) return [3 /*break*/, 6];
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Ministry', {
                            name: "" + ministryName3 + j,
                            government: {
                                connect: {
                                    id: createdGovernment.id
                                }
                            }
                        })];
                case 4:
                    createdMinistry = _a.sent();
                    ministries.push(createdMinistry);
                    _a.label = 5;
                case 5:
                    j += 1;
                    return [3 /*break*/, 3];
                case 6:
                    i += 1;
                    return [3 /*break*/, 1];
                case 7: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                        where: {
                            AND: [
                                {
                                    ministries_every: { name_starts_with: ministryName3 }
                                },
                                {
                                    lobbyists_none: {
                                        governments_some: {
                                            name_starts_with: 'f567oo'
                                        }
                                    }
                                },
                                {
                                    name_starts_with: governmentName1
                                }
                            ]
                        },
                        first: 4,
                        skip: 1,
                        orderBy: 'createdAt_ASC'
                    })];
                case 8:
                    fetchedGovernments = _a.sent();
                    expect(lodash_1.uniq(fetchedGovernments.map(function (g) { return g.id; }))).toHaveLength(4);
                    return [2 /*return*/];
            }
        });
    }); });
    test('getAllEntities with nested _some filter for 1xn relation, with limit', function () { return __awaiter(void 0, void 0, void 0, function () {
        var i, fetchedGovernments, fetchedMinistries;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 20)) return [3 /*break*/, 4];
                    // eslint-disable-next-line no-await-in-loop
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Ministry', {
                            name: "" + ministryName1 + i,
                            government: {
                                connect: {
                                    id: government1.id
                                }
                            }
                        })];
                case 2:
                    // eslint-disable-next-line no-await-in-loop
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i += 1;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                        where: {
                            OR: [
                                {
                                    ministries_some: { name_starts_with: "Finance" + randomNumber }
                                },
                                {
                                    name: governmentName2
                                }
                            ]
                        },
                        first: 10,
                        orderBy: 'createdAt_ASC'
                    })];
                case 5:
                    fetchedGovernments = _a.sent();
                    expect(fetchedGovernments).toHaveLength(2);
                    return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Ministry', {
                            where: {
                                government: {
                                    lobbyists_none: {
                                        governments_some: {
                                            name: governmentName1
                                        }
                                    }
                                }
                            },
                            first: 10,
                            skip: 3,
                            orderBy: 'createdAt_ASC'
                        })];
                case 6:
                    fetchedMinistries = _a.sent();
                    expect(fetchedMinistries).toHaveLength(10);
                    return [2 /*return*/];
            }
        });
    }); });
    test('getAllEntities with nested _some filter for nxm relation, with limit', function () { return __awaiter(void 0, void 0, void 0, function () {
        function createVotesForMinister(ministerId) {
            return __awaiter(this, void 0, void 0, function () {
                var i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < 5)) return [3 /*break*/, 4];
                            // eslint-disable-next-line no-await-in-loop
                            return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Vote', {
                                    name: "" + voteName1 + i,
                                    ballot: voteBallot1,
                                    minister: {
                                        connect: {
                                            id: ministerId
                                        }
                                    }
                                })];
                        case 2:
                            // eslint-disable-next-line no-await-in-loop
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            i += 1;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        var fetchedMinisters;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createVotesForMinister(minister1.id)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, createVotesForMinister(minister2.id)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Minister', {
                            where: {
                                AND: [
                                    {
                                        votes_some: { ballot: voteBallot1 }
                                    },
                                    {
                                        name_in: [ministerName1, ministerName2]
                                    }
                                ]
                            },
                            first: 2,
                            orderBy: 'createdAt_ASC'
                        })];
                case 3:
                    fetchedMinisters = _a.sent();
                    expect(fetchedMinisters).toHaveLength(2);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=sequelizeDataProviderPaging.test.js.map