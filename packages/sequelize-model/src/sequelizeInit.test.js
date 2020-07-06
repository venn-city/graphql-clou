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
/* eslint-disable import/first */
process.env.CLS_ENABLED = 'true';
process.env.IS_TEST = 'false';
var faker_1 = require("faker");
var model_1 = __importDefault(require("../../../test/model"));
var sequelizeInit_1 = __importDefault(require("./sequelizeInit"));
sequelizeInit_1.default.init(model_1.default);
var DUMMY_MODEL_FUNCTION = function () { return ({ associate: function () { } }); };
var sequelize = sequelizeInit_1.default.sequelize;
describe('sequelizeInit', function () {
    afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sequelizeInit_1.default.sequelize.close()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should only init the sequelize models once', function () {
        expect(sequelizeInit_1.default.initialized).toBeTruthy();
        sequelizeInit_1.default.init({
            DummyModel: DUMMY_MODEL_FUNCTION
        });
        expect(sequelizeInit_1.default).not.toHaveProperty('DummyModel');
    });
    test('sequelize should be initialized properly with models for all test schema entities', function () { return __awaiter(void 0, void 0, void 0, function () {
        var governments, missingGovernment, ministers, ministries, votes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sequelizeInit_1.default.Government.findAll({ where: { id: 'x' } })];
                case 1:
                    governments = _a.sent();
                    expect(governments).toHaveLength(0);
                    return [4 /*yield*/, sequelizeInit_1.default.Government.findOne({ where: { id: 'x' } })];
                case 2:
                    missingGovernment = _a.sent();
                    expect(missingGovernment).toBeNull();
                    return [4 /*yield*/, sequelizeInit_1.default.Minister.findAll({ where: { id: 'x' } })];
                case 3:
                    ministers = _a.sent();
                    expect(ministers).toHaveLength(0);
                    return [4 /*yield*/, sequelizeInit_1.default.Ministry.findAll({ where: { id: 'x' } })];
                case 4:
                    ministries = _a.sent();
                    expect(ministries).toHaveLength(0);
                    return [4 /*yield*/, sequelizeInit_1.default.Vote.findAll({ where: { id: 'x' } })];
                case 5:
                    votes = _a.sent();
                    expect(votes).toHaveLength(0);
                    return [2 /*return*/];
            }
        });
    }); });
    test('sequelize should call schema hooks', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createdMinistries, createdMinistriesBudgets, createdMinistry, fetchedMinistry, updatedEntity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sequelizeInit_1.default.Ministry.bulkCreate([
                        { name: faker_1.hacker.phrase(), budget: 100 },
                        { name: faker_1.hacker.phrase(), budget: 200 }
                    ])];
                case 1:
                    createdMinistries = _a.sent();
                    createdMinistries.forEach(function (ministry) { return expect(ministry).toHaveProperty('id'); });
                    createdMinistriesBudgets = createdMinistries.map(function (ministry) { return ministry.budget; });
                    expect(createdMinistriesBudgets).toContain(100);
                    expect(createdMinistriesBudgets).toContain(200);
                    return [4 /*yield*/, sequelizeInit_1.default.Ministry.create({ name: faker_1.hacker.phrase(), budget: 77.9 })];
                case 2:
                    createdMinistry = _a.sent();
                    return [4 /*yield*/, sequelizeInit_1.default.Ministry.findOne({
                            where: {
                                id: createdMinistry.id
                            }
                        })];
                case 3:
                    fetchedMinistry = _a.sent();
                    return [4 /*yield*/, fetchedMinistry.update({
                            budget: 88.2
                        })];
                case 4:
                    updatedEntity = _a.sent();
                    expect(updatedEntity.dataValues).toHaveProperty('budget', 88.2);
                    expect(updatedEntity.dataValues).toHaveProperty('deleted', 0);
                    return [2 /*return*/];
            }
        });
    }); });
    test('sequelize should not format a float of null', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createdMinistry;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sequelizeInit_1.default.Ministry.create({ name: faker_1.hacker.phrase(), budget: null })];
                case 1:
                    createdMinistry = _a.sent();
                    expect(createdMinistry.dataValues).toHaveProperty('budget', null);
                    return [2 /*return*/];
            }
        });
    }); });
    test('sequelize should call schema hooks on related fields (nesting)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var num1, num2, ministerName, vote1, vote2, createdMinister, fetchedMinister, ministerVotes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    num1 = faker_1.random.number();
                    num2 = faker_1.random.number();
                    ministerName = faker_1.hacker.phrase();
                    return [4 /*yield*/, sequelizeInit_1.default.Vote.create({ name: "vote" + num1 })];
                case 1:
                    vote1 = _a.sent();
                    return [4 /*yield*/, sequelizeInit_1.default.Vote.create({ name: "vote" + num2 })];
                case 2:
                    vote2 = _a.sent();
                    return [4 /*yield*/, sequelizeInit_1.default.Minister.create({ name: ministerName, budget: 1313 })];
                case 3:
                    createdMinister = _a.sent();
                    return [4 /*yield*/, createdMinister.addVotes([vote1.id, vote2.id])];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, sequelizeInit_1.default.Minister.findOne({
                            where: { id: createdMinister.id },
                            include: {
                                model: sequelizeInit_1.default.Vote,
                                as: 'votes',
                                attributes: ['createdAt', 'updatedAt']
                            }
                        })];
                case 5:
                    fetchedMinister = _a.sent();
                    expect(fetchedMinister.dataValues.votes).toHaveLength(2);
                    ministerVotes = fetchedMinister.dataValues.votes;
                    ministerVotes.forEach(function (v) {
                        expect(typeof v.dataValues.createdAt === 'string').toBeTruthy();
                        expect(typeof v.dataValues.updatedAt === 'string').toBeTruthy();
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    test('sequelize should support block transactions using cls namespace without using transaction explicitly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var originalBudget, createdMinistry, errorMessage, e_1, ministryAfterTransaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originalBudget = 80;
                    return [4 /*yield*/, sequelizeInit_1.default.Ministry.create({ name: faker_1.hacker.phrase(), budget: originalBudget })];
                case 1:
                    createdMinistry = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, sequelize.transaction(function () { return __awaiter(void 0, void 0, void 0, function () {
                            var newBudget, fetchedMinistry, ministryDuringTransaction;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        newBudget = 88.2;
                                        return [4 /*yield*/, sequelizeInit_1.default.Ministry.findOne({
                                                where: {
                                                    id: createdMinistry.id
                                                }
                                            })];
                                    case 1:
                                        fetchedMinistry = _a.sent();
                                        return [4 /*yield*/, fetchedMinistry.update({ budget: newBudget })];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, sequelizeInit_1.default.Ministry.findOne({ where: { id: createdMinistry.id } })];
                                    case 3:
                                        ministryDuringTransaction = _a.sent();
                                        expect(ministryDuringTransaction.dataValues).toHaveProperty('budget', newBudget);
                                        throw new Error('Some error that occurred during a transaction');
                                }
                            });
                        }); })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    errorMessage = e_1.message;
                    return [3 /*break*/, 5];
                case 5:
                    expect(errorMessage).toEqual('Some error that occurred during a transaction');
                    return [4 /*yield*/, sequelizeInit_1.default.Ministry.findOne({ where: { id: createdMinistry.id } })];
                case 6:
                    ministryAfterTransaction = _a.sent();
                    expect(ministryAfterTransaction.dataValues).toHaveProperty('budget', originalBudget);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=sequelizeInit.test.js.map