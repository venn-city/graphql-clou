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
describe('sequelizeDataProvider', function () {
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
    var randomNumber = faker_1.random.number();
    var government1;
    var governmentName1 = "9500BC" + randomNumber;
    var governmentCountry1 = "Atlantis" + randomNumber;
    var government2;
    var governmentName2 = "1966" + randomNumber;
    var governmentCountry2 = "Sorcha" + randomNumber;
    var ministry1;
    var ministryName1 = "Finance" + randomNumber;
    var ministryBudget1 = 87 + randomNumber;
    var ministry2;
    var ministryName2 = "Defence" + randomNumber;
    var ministryBudget2 = 22.1 + randomNumber;
    var ministry3;
    var ministryName3 = "Healthcare" + randomNumber;
    var ministryBudget3 = 22.1 + randomNumber;
    var minister1;
    var ministerName1 = "Lazaros" + randomNumber;
    var minister2;
    var ministerName2 = "Natassas" + randomNumber;
    var minister3;
    var ministerName3 = "Vasileia" + randomNumber;
    var voteName1 = "Build walls" + randomNumber;
    var voteBallot1 = 'YEA';
    var voteName2 = "Build walls" + randomNumber;
    var voteBallot2 = 'NAY';
    var voteName3 = "Raise taxes" + randomNumber;
    var voteBallot3 = 'NAY';
    var vote4;
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
                    government2 = _a.sent();
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
                    minister3 = _a.sent();
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
                    ministry1 = _a.sent();
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
                    ministry2 = _a.sent();
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
                    ministry3 = _a.sent();
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
                            ballot: voteBallot4,
                            lawInfo: { a: 'b' },
                            lawInfoJson: { x: 'y' }
                        })];
                case 12:
                    vote4 = _a.sent();
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
    test('getEntity', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchedGovernment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getEntity('Government', { name: governmentName1 })];
                case 1:
                    fetchedGovernment = _a.sent();
                    expect(fetchedGovernment).toMatchObject(government1);
                    return [2 /*return*/];
            }
        });
    }); });
    describe('getAllEntities', function () {
        test('getAllEntities simple', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fetchedGovernments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', { where: { name: governmentName1 } })];
                    case 1:
                        fetchedGovernments = _a.sent();
                        expect(fetchedGovernments).toHaveLength(1);
                        expect(fetchedGovernments[0]).toMatchObject(government1);
                        return [2 /*return*/];
                }
            });
        }); });
        describe('Complex nested filters', function () {
            test('1xn_every => 1x1 => nxm_some', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: { ministries_every: { minister: { votes_some: { name: voteName1 } } }, name_ends_with: "" + randomNumber },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(1);
                            expect(fetchedGovernments[0]).toMatchObject(government2);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('1xn_none => 1x1 => nxm_some', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: { ministries_none: { minister: { votes_some: { name: voteName1 } } }, name: governmentName2 },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(1);
                            expect(fetchedGovernments[0]).toMatchObject(government2);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('nxm_none => nxm_some', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: {
                                    lobbyists_none: {
                                        governments_some: {
                                            name: governmentName1
                                        }
                                    },
                                    name: governmentName1
                                },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(1);
                            expect(fetchedGovernments[0]).toMatchObject(government1);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('nxm_every => nxm_some', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: {
                                    lobbyists_every: {
                                        governments_some: {
                                            name: governmentName1
                                        }
                                    },
                                    name: governmentName1
                                },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(1);
                            expect(fetchedGovernments[0]).toMatchObject(government1);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('1x1', function () {
            test('getAllEntities with nested filter for 1x1 relation', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinistries;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Ministry', {
                                where: { minister: { name: ministerName1 } },
                                first: 5
                            })];
                        case 1:
                            fetchedMinistries = _a.sent();
                            expect(fetchedMinistries).toHaveLength(1);
                            expect(fetchedMinistries[0]).toMatchObject(ministry1);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested filter for 1x1 null (non-existing) relation', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinistries;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Ministry', {
                                where: { minister: null, name: ministryName3 },
                                first: 5
                            })];
                        case 1:
                            fetchedMinistries = _a.sent();
                            expect(fetchedMinistries).toHaveLength(1);
                            expect(fetchedMinistries[0]).toMatchObject(ministry3);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('1xn', function () {
            test('getAllEntities with nested _every filter for 1xn relation, _every condition complies', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: { ministries_every: { name_ends_with: "e" + randomNumber }, name: governmentName1 },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(1);
                            expect(fetchedGovernments[0]).toMatchObject(government1);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _every filter for 1xn relation, and another level of nesting', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: { ministries_every: { name_ends_with: "e" + randomNumber, minister: { name_ends_with: "" + randomNumber } }, name: governmentName1 },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(1);
                            expect(fetchedGovernments[0]).toMatchObject(government1);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _every filter for 1xn relation, _every condition not complies', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: { ministries_none: { name_ends_with: "re" + randomNumber }, name: governmentName1 },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _every filter for 1xn relation, _every condition complies emptily', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: { ministries_none: { name_ends_with: "e" + randomNumber }, name: governmentName2 },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(1);
                            expect(fetchedGovernments[0]).toMatchObject(government2);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _none filter for 1xn relation, _none condition complies', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: { ministries_every: { name_ends_with: "e" + randomNumber }, name: governmentName1 },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(1);
                            expect(fetchedGovernments[0]).toMatchObject(government1);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _none filter for 1xn relation, _none condition not complies', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: { ministries_every: { name_ends_with: "ce" + randomNumber }, name: governmentName1 },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _none filter for 1xn relation, _none condition complies emptily', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: { ministries_none: { name_ends_with: "e" + randomNumber }, name: governmentName2 },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(1);
                            expect(fetchedGovernments[0]).toMatchObject(government2);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _some filter for 1xn relation, _some condition complies', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: { ministries_some: { name_ends_with: "re" + randomNumber }, name: governmentName1 },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(1);
                            expect(fetchedGovernments[0]).toMatchObject(government1);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _some filter for 1xn relation, _some condition not complies', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: { ministries_some: { name_ends_with: "XX" + randomNumber }, name: governmentName1 },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _some filter for 1xn relation, _some condition not complies emptily', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedGovernments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                                where: { ministries_some: { name_ends_with: "e" + randomNumber }, name: governmentName2 },
                                first: 5
                            })];
                        case 1:
                            fetchedGovernments = _a.sent();
                            expect(fetchedGovernments).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _some filter for 1xn relation, inside 1x1', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinistries;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Ministry', {
                                where: { government: { ministries_some: { name_ends_with: "re" + randomNumber }, name: governmentName1 } },
                                first: 5
                            })];
                        case 1:
                            fetchedMinistries = _a.sent();
                            expect(fetchedMinistries).toHaveLength(3);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _none filter for 1xn relation, inside 1x1', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinistries;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Ministry', {
                                where: { government: { ministries_none: { name_ends_with: "re" + randomNumber }, name: governmentName1 } },
                                first: 5
                            })];
                        case 1:
                            fetchedMinistries = _a.sent();
                            expect(fetchedMinistries).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with orderBy arg', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinistriesDESC, fetchedMinistriedDefaultOrderBy;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Ministry', {
                                where: { government: { ministries_some: { name_ends_with: "re" + randomNumber }, name: governmentName1 } },
                                orderBy: 'id_DESC'
                            })];
                        case 1:
                            fetchedMinistriesDESC = _a.sent();
                            expect(fetchedMinistriesDESC).toHaveLength(3);
                            return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Ministry', {
                                    where: { government: { ministries_some: { name_ends_with: "re" + randomNumber }, name: governmentName1 } }
                                })];
                        case 2:
                            fetchedMinistriedDefaultOrderBy = _a.sent();
                            expect(fetchedMinistriedDefaultOrderBy).toHaveLength(3);
                            expect(fetchedMinistriesDESC.reverse()).toEqual(fetchedMinistriedDefaultOrderBy);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('nxm', function () {
            test('getAllEntities with nested _every filter for nxm relation, _every condition complies', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinisters;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Minister', {
                                where: { votes_every: { ballot: 'NAY' }, id: minister2.id },
                                first: 5
                            })];
                        case 1:
                            fetchedMinisters = _a.sent();
                            expect(fetchedMinisters).toHaveLength(1);
                            expect(fetchedMinisters[0]).toMatchObject(minister2);
                            return [2 /*return*/];
                    }
                });
            }); });
            // TODO: Fails without first filtering!
            test('getAllEntities with nested _every filter for nxm and 1x1 relations', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinisters;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Minister', {
                                where: { votes_every: { ballot: 'NAY' }, id: minister2.id, ministry: { name: ministryName2 } },
                                first: 5
                            })];
                        case 1:
                            fetchedMinisters = _a.sent();
                            expect(fetchedMinisters).toHaveLength(1);
                            expect(fetchedMinisters[0]).toMatchObject(minister2);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _every filter for nxm relation, _every condition not complies', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinisters;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Minister', {
                                where: { votes_every: { name: "Build walls" + randomNumber }, id: minister2.id },
                                first: 5
                            })];
                        case 1:
                            fetchedMinisters = _a.sent();
                            expect(fetchedMinisters).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _every filter for nxm relation, _every condition complies emptily', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinisters;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Minister', {
                                where: { votes_every: { ballot: 'NAY' }, id: minister3.id },
                                first: 5
                            })];
                        case 1:
                            fetchedMinisters = _a.sent();
                            expect(fetchedMinisters).toHaveLength(1);
                            expect(fetchedMinisters[0]).toMatchObject(minister3);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _none filter for nxm relation, _none condition complies', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinisters;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Minister', {
                                where: { votes_none: { name: 'Fix roads' }, id: minister2.id },
                                first: 5
                            })];
                        case 1:
                            fetchedMinisters = _a.sent();
                            expect(fetchedMinisters).toHaveLength(1);
                            expect(fetchedMinisters[0]).toMatchObject(minister2);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _none filter for nxm relation, _none condition not complies', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinisters;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Minister', {
                                where: { votes_none: { ballot: 'NAY' }, id: minister2.id },
                                first: 5
                            })];
                        case 1:
                            fetchedMinisters = _a.sent();
                            expect(fetchedMinisters).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _none filter for nxm relation, _none condition complies emptily', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinisters;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Minister', {
                                where: { votes_none: { ballot: 'NAY' }, id: minister3.id },
                                first: 5
                            })];
                        case 1:
                            fetchedMinisters = _a.sent();
                            expect(fetchedMinisters).toHaveLength(1);
                            expect(fetchedMinisters[0]).toMatchObject(minister3);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _some filter for nxm relation, _some condition complies', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinisters;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Minister', {
                                where: { votes_some: { name: "Build walls" + randomNumber }, id: minister2.id },
                                first: 5
                            })];
                        case 1:
                            fetchedMinisters = _a.sent();
                            expect(fetchedMinisters).toHaveLength(1);
                            expect(fetchedMinisters[0]).toMatchObject(minister2);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _some filter for nxm relation, _some condition not complies', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinisters;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Minister', {
                                where: { votes_some: { ballot: 'ABSTAIN' }, id: minister2.id },
                                first: 5
                            })];
                        case 1:
                            fetchedMinisters = _a.sent();
                            expect(fetchedMinisters).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _some filter for nxm relation, _some condition not complies emptily', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinisters;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Minister', {
                                where: { votes_some: { ballot: 'NAY' }, id: minister3.id },
                                first: 5
                            })];
                        case 1:
                            fetchedMinisters = _a.sent();
                            expect(fetchedMinisters).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities with nested _some filter for nxm relation, _some condition not complies emptily', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedMinisters;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Minister', {
                                where: { votes_some: { ballot: 'NAY' }, id: minister3.id },
                                first: 5
                            })];
                        case 1:
                            fetchedMinisters = _a.sent();
                            expect(fetchedMinisters).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('getAllEntities for nxm null (non-existing) relation', function () { return __awaiter(void 0, void 0, void 0, function () {
                var fetchedVotes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Vote', {
                                where: { minister: null, name_ends_with: "" + randomNumber },
                                first: 5
                            })];
                        case 1:
                            fetchedVotes = _a.sent();
                            expect(fetchedVotes).toHaveLength(1);
                            expect(fetchedVotes[0]).toMatchObject(vote4);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    test('getEntitiesConnection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchedGovernmentConnection;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getEntitiesConnection('Government', { where: { name: governmentName1 } })];
                case 1:
                    fetchedGovernmentConnection = _a.sent();
                    expect(fetchedGovernmentConnection).toHaveProperty('aggregate', { __typename: 'AggregateGovernment', count: 1 });
                    return [2 /*return*/];
            }
        });
    }); });
    test('getRelatedEntity', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchedGovernment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getRelatedEntity('Ministry', ministry1.id, 'government')];
                case 1:
                    fetchedGovernment = _a.sent();
                    expect(fetchedGovernment).toMatchObject(government1);
                    return [2 /*return*/];
            }
        });
    }); });
    test('getRelatedEntityId', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchedGovernmentId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getRelatedEntityId('Ministry', ministry1.id, 'government')];
                case 1:
                    fetchedGovernmentId = _a.sent();
                    expect(fetchedGovernmentId).toEqual(government1.id);
                    return [2 /*return*/];
            }
        });
    }); });
    test('getRelatedEntities', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchedMinistries;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getRelatedEntities('Government', government1.id, 'ministries')];
                case 1:
                    fetchedMinistries = _a.sent();
                    expect(fetchedMinistries.sort().map(function (m) { return lodash_1.omit(m, 'ministerId'); })).toEqual([ministry1, ministry2, ministry3].sort().map(function (m) { return lodash_1.omit(m, 'ministerId'); }));
                    return [2 /*return*/];
            }
        });
    }); });
    describe('getRelatedEntityIds', function () {
        test('getRelatedEntityIds no args', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fetchedMinistryIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getRelatedEntityIds('Government', government1.id, 'ministries')];
                    case 1:
                        fetchedMinistryIds = _a.sent();
                        expect(fetchedMinistryIds.sort()).toEqual([ministry1.id, ministry2.id, ministry3.id].sort());
                        return [2 /*return*/];
                }
            });
        }); });
        test('getRelatedEntityIds with args', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fetchedMinistryIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getRelatedEntityIds('Government', government1.id, 'ministries', {
                            first: 1,
                            orderBy: 'createdAt_ASC'
                        })];
                    case 1:
                        fetchedMinistryIds = _a.sent();
                        expect(fetchedMinistryIds).toHaveLength(1);
                        expect(fetchedMinistryIds[0]).toEqual(ministry1.id);
                        return [2 /*return*/];
                }
            });
        }); });
        test('getRelatedEntityIds with args for nXm relation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fetchedVoteIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.getRelatedEntityIds('Minister', minister2.id, 'votes', {
                            first: 1,
                            orderBy: 'createdAt_ASC'
                        })];
                    case 1:
                        fetchedVoteIds = _a.sent();
                        expect(fetchedVoteIds).toHaveLength(1);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Create many entities', function () {
        test('simple', function () { return __awaiter(void 0, void 0, void 0, function () {
            var government1Name, government2Name, createdGovernments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        government1Name = faker_1.hacker.phrase();
                        government2Name = faker_1.hacker.phrase();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.createManyEntities('Government', [
                                {
                                    name: government1Name
                                },
                                {
                                    name: government2Name
                                }
                            ])];
                    case 1:
                        createdGovernments = _a.sent();
                        expect(createdGovernments).toHaveLength(2);
                        expect(createdGovernments[0]).toHaveProperty('name', government1Name);
                        expect(createdGovernments[1]).toHaveProperty('name', government2Name);
                        return [2 /*return*/];
                }
            });
        }); });
        test('with nested connect', function () { return __awaiter(void 0, void 0, void 0, function () {
            var government1Name, government2Name, ministry1Name, ministry2Name, ministry3Name, ministry4Name, minsitry1, minsitry2, minsitry3, minsitry4, createdGovernments, government1Ministries, government1MinistryNames, government2Ministries, government2MinistryNames;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        government1Name = faker_1.hacker.phrase();
                        government2Name = faker_1.hacker.phrase();
                        ministry1Name = faker_1.hacker.phrase();
                        ministry2Name = faker_1.hacker.phrase();
                        ministry3Name = faker_1.hacker.phrase();
                        ministry4Name = faker_1.hacker.phrase();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Ministry', { name: ministry1Name })];
                    case 1:
                        minsitry1 = _a.sent();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Ministry', { name: ministry2Name })];
                    case 2:
                        minsitry2 = _a.sent();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Ministry', { name: ministry3Name })];
                    case 3:
                        minsitry3 = _a.sent();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Ministry', { name: ministry4Name })];
                    case 4:
                        minsitry4 = _a.sent();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.createManyEntities('Government', [
                                {
                                    name: government1Name,
                                    ministries: {
                                        connect: [{ id: minsitry1.id }, { id: minsitry2.id }]
                                    }
                                },
                                {
                                    name: government2Name,
                                    ministries: {
                                        connect: [{ id: minsitry3.id }, { id: minsitry4.id }]
                                    }
                                }
                            ])];
                    case 5:
                        createdGovernments = _a.sent();
                        expect(createdGovernments).toHaveLength(2);
                        expect(createdGovernments[0]).toHaveProperty('name', government1Name);
                        expect(createdGovernments[1]).toHaveProperty('name', government2Name);
                        return [4 /*yield*/, sequelizeDataProvider_1.default.getRelatedEntities('Government', createdGovernments[0].id, 'ministries')];
                    case 6:
                        government1Ministries = _a.sent();
                        expect(government1Ministries).toHaveLength(2);
                        government1MinistryNames = government1Ministries.map(function (ministry) { return ministry.name; });
                        expect(government1MinistryNames).toContain(ministry1Name);
                        expect(government1MinistryNames).toContain(ministry2Name);
                        return [4 /*yield*/, sequelizeDataProvider_1.default.getRelatedEntities('Government', createdGovernments[1].id, 'ministries')];
                    case 7:
                        government2Ministries = _a.sent();
                        expect(government2Ministries).toHaveLength(2);
                        government2MinistryNames = government2Ministries.map(function (ministry) { return ministry.name; });
                        expect(government2MinistryNames).toContain(ministry3Name);
                        expect(government2MinistryNames).toContain(ministry4Name);
                        return [2 /*return*/];
                }
            });
        }); });
        test('with nested create - should throw error until supported', function () { return __awaiter(void 0, void 0, void 0, function () {
            var government1Name, government2Name, ministry1Name, ministry2Name, ministry3Name, ministry4Name;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        government1Name = faker_1.hacker.phrase();
                        government2Name = faker_1.hacker.phrase();
                        ministry1Name = faker_1.hacker.phrase();
                        ministry2Name = faker_1.hacker.phrase();
                        ministry3Name = faker_1.hacker.phrase();
                        ministry4Name = faker_1.hacker.phrase();
                        return [4 /*yield*/, expect(sequelizeDataProvider_1.default.createManyEntities('Government', [
                                {
                                    name: government1Name,
                                    ministries: {
                                        create: [{ name: ministry1Name }, { name: ministry2Name }]
                                    }
                                },
                                {
                                    name: government2Name,
                                    ministries: {
                                        create: [{ name: ministry3Name }, { name: ministry4Name }]
                                    }
                                }
                            ])).rejects.toThrowError('Nested create of entities inside of createMany is not currently supported')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    test('createEntity', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createdGovernmentName, createdGovernment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createdGovernmentName = faker_1.hacker.phrase();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Government', { name: createdGovernmentName })];
                case 1:
                    createdGovernment = _a.sent();
                    expect(createdGovernment).toMatchObject({
                        name: createdGovernmentName,
                        createdAt: createdGovernment.createdAt,
                        updatedAt: createdGovernment.updatedAt,
                        deletedAt: null,
                        deleted: 0
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    test('createEntity should fail if join parameter is not valid', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createdMinistryName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createdMinistryName = faker_1.hacker.phrase();
                    return [4 /*yield*/, expect(sequelizeDataProvider_1.default.createEntity('Ministry', { name: createdMinistryName, government: { connect: {} } })).rejects.toThrowError('Invalid argument in government parameter')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('Update entity', function () {
        test('updateEntity', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createdGovernmentName, updatedGovernmentName, createdGovernment, updatedGovernment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createdGovernmentName = faker_1.hacker.phrase();
                        updatedGovernmentName = faker_1.hacker.phrase();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Government', { name: createdGovernmentName })];
                    case 1:
                        createdGovernment = _a.sent();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.updateEntity('Government', {
                                name: updatedGovernmentName
                            }, {
                                name: createdGovernmentName
                            })];
                    case 2:
                        updatedGovernment = _a.sent();
                        expect(updatedGovernment).toMatchObject({
                            name: updatedGovernmentName,
                            createdAt: createdGovernment.createdAt,
                            updatedAt: updatedGovernment.updatedAt,
                            deletedAt: null,
                            deleted: 0
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        test('updateEntity should fail if join parameter is not valid', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createdMinistryName, ministryBudget, createdMinistry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createdMinistryName = faker_1.hacker.phrase();
                        ministryBudget = 10 + randomNumber;
                        return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Ministry', { name: createdMinistryName, budget: ministryBudget })];
                    case 1:
                        createdMinistry = _a.sent();
                        return [4 /*yield*/, expect(sequelizeDataProvider_1.default.updateEntity('Ministry', { government: { connect: {} } }, { id: createdMinistry.id })).rejects.toThrowError('Invalid argument in government parameter')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('updateEntity which does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updatedGovernment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sequelizeDataProvider_1.default.updateEntity('Government', {
                            name: faker_1.hacker.phrase()
                        }, {
                            id: faker_1.hacker.phrase()
                        })];
                    case 1:
                        updatedGovernment = _a.sent();
                        expect(updatedGovernment).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
        test('updateEntity with connect and disconnect', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createdGovernmentName, updatedGovernmentName, anotherGovernment, minsitry, minsitry2, updatedGovernmentWithMinistries, ministryIds, ministryIdsAfterDisconnect;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createdGovernmentName = faker_1.hacker.phrase();
                        updatedGovernmentName = faker_1.hacker.phrase();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Government', { name: createdGovernmentName })];
                    case 1:
                        anotherGovernment = _a.sent();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Ministry', { name: faker_1.hacker.phrase() })];
                    case 2:
                        minsitry = _a.sent();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Ministry', { name: faker_1.hacker.phrase() })];
                    case 3:
                        minsitry2 = _a.sent();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.updateEntity('Government', {
                                name: updatedGovernmentName,
                                ministries: {
                                    connect: [{ id: minsitry.id }, { id: minsitry2.id }]
                                }
                            }, {
                                name: createdGovernmentName
                            })];
                    case 4:
                        updatedGovernmentWithMinistries = _a.sent();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.getRelatedEntityIds('Government', anotherGovernment.id, 'ministries')];
                    case 5:
                        ministryIds = _a.sent();
                        expect(ministryIds.sort()).toEqual([minsitry.id, minsitry2.id].sort());
                        expect(updatedGovernmentWithMinistries).toMatchObject({
                            name: updatedGovernmentName,
                            createdAt: updatedGovernmentWithMinistries.createdAt,
                            updatedAt: updatedGovernmentWithMinistries.updatedAt,
                            deletedAt: null,
                            deleted: 0
                        });
                        // Update with disconnect.
                        return [4 /*yield*/, sequelizeDataProvider_1.default.updateEntity('Government', {
                                name: updatedGovernmentName,
                                ministries: {
                                    disconnect: [{ id: minsitry.id }, { id: minsitry2.id }]
                                }
                            }, {
                                name: updatedGovernmentName
                            })];
                    case 6:
                        // Update with disconnect.
                        _a.sent();
                        return [4 /*yield*/, sequelizeDataProvider_1.default.getRelatedEntityIds('Government', anotherGovernment.id, 'ministries')];
                    case 7:
                        ministryIdsAfterDisconnect = _a.sent();
                        expect(ministryIdsAfterDisconnect).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    test('deleteEntity', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createdGovernmentName, deletedGovernment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createdGovernmentName = faker_1.hacker.phrase();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Government', { name: createdGovernmentName })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.deleteEntity('Government', { name: createdGovernmentName })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.getEntity('Government', {
                            name: createdGovernmentName
                        })];
                case 3:
                    deletedGovernment = _a.sent();
                    expect(deletedGovernment).toBeFalsy();
                    return [2 /*return*/];
            }
        });
    }); });
    test('updateManyEntities', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createdGovernmentName1, createdGovernmentName2, updatedGovernmentName, updatedGovernments;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createdGovernmentName1 = faker_1.hacker.phrase();
                    createdGovernmentName2 = faker_1.hacker.phrase();
                    updatedGovernmentName = faker_1.hacker.phrase();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Government', { name: createdGovernmentName1 })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Government', { name: createdGovernmentName2 })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.updateManyEntities('Government', {
                            name: updatedGovernmentName
                        }, {
                            name_in: [createdGovernmentName1, createdGovernmentName2]
                        })];
                case 3:
                    updatedGovernments = _a.sent();
                    updatedGovernments.forEach(function (updatedGovernment) {
                        expect(updatedGovernment).toMatchObject({
                            name: updatedGovernmentName,
                            createdAt: updatedGovernment.createdAt,
                            updatedAt: updatedGovernment.updatedAt,
                            deletedAt: null,
                            deleted: 0
                        });
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    test('deleteManyEntities', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createdGovernmentName1, createdGovernmentName2, deletedGovernments;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createdGovernmentName1 = faker_1.hacker.phrase();
                    createdGovernmentName2 = faker_1.hacker.phrase();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Government', { name: createdGovernmentName1 })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.createEntity('Government', { name: createdGovernmentName2 })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.deleteManyEntities('Government', {
                            name_in: [createdGovernmentName1, createdGovernmentName2]
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, sequelizeDataProvider_1.default.getAllEntities('Government', {
                            where: {
                                name_in: [createdGovernmentName1, createdGovernmentName2]
                            }
                        })];
                case 4:
                    deletedGovernments = _a.sent();
                    expect(deletedGovernments).toHaveLength(0);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=sequelizeDataProvider.test.js.map