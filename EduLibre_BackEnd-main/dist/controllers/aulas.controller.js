"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aula_service_1 = __importDefault(require("../services/aula.service"));
const async_handler_1 = __importDefault(require("../utils/async-handler"));
class AulasController {
    static featured = (0, async_handler_1.default)(async (_req, res) => {
        const aulas = await aula_service_1.default.featured();
        res.status(200).json(aulas);
    });
    static findAll = (0, async_handler_1.default)(async (req, res) => {
        const aulas = await aula_service_1.default.list(req.query);
        res.status(200).json(aulas);
    });
    static getById = (0, async_handler_1.default)(async (req, res) => {
        const aula = await aula_service_1.default.findById(Number(req.params.id));
        res.status(200).json(aula);
    });
    static create = (0, async_handler_1.default)(async (req, res) => {
        const aula = await aula_service_1.default.create(req.body);
        res.status(201).json(aula);
    });
    static update = (0, async_handler_1.default)(async (req, res) => {
        const aula = await aula_service_1.default.update(Number(req.params.id), req.body);
        res.status(200).json(aula);
    });
    static remove = (0, async_handler_1.default)(async (req, res) => {
        await aula_service_1.default.remove(Number(req.params.id));
        res.status(204).send();
    });
}
exports.default = AulasController;
