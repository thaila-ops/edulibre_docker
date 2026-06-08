"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const agendamento_service_1 = __importDefault(require("../services/agendamento.service"));
const async_handler_1 = __importDefault(require("../utils/async-handler"));
const http_error_1 = __importDefault(require("../utils/http-error"));
class AgendamentosController {
    static findAll = (0, async_handler_1.default)(async (req, res) => {
        const agendamentos = await agendamento_service_1.default.list(req.query);
        res.status(200).json(agendamentos);
    });
    static getById = (0, async_handler_1.default)(async (req, res) => {
        const agendamento = await agendamento_service_1.default.findById(Number(req.params.id));
        res.status(200).json(agendamento);
    });
    static create = (0, async_handler_1.default)(async (req, res) => {
        const agendamento = await agendamento_service_1.default.create(req.body);
        res.status(201).json(agendamento);
    });
    static update = (0, async_handler_1.default)(async (req, res) => {
        const agendamento = await agendamento_service_1.default.update(Number(req.params.id), req.body);
        res.status(200).json(agendamento);
    });
    static remove = (0, async_handler_1.default)(async (req, res) => {
        await agendamento_service_1.default.remove(Number(req.params.id));
        res.status(204).send();
    });
    static pay = (0, async_handler_1.default)(async (req, res) => {
        const authUserId = req.authUser?.id;
        if (!authUserId)
            throw new http_error_1.default(401, 'Não autenticado.');
        const agendamento = await agendamento_service_1.default.pay(Number(req.params.id), authUserId);
        res.status(200).json(agendamento);
    });
    static accept = (0, async_handler_1.default)(async (req, res) => {
        const authUserId = req.authUser?.id;
        if (!authUserId)
            throw new http_error_1.default(401, 'Não autenticado.');
        const agendamento = await agendamento_service_1.default.decide(Number(req.params.id), authUserId, 'aceito');
        res.status(200).json(agendamento);
    });
    static reject = (0, async_handler_1.default)(async (req, res) => {
        const authUserId = req.authUser?.id;
        if (!authUserId)
            throw new http_error_1.default(401, 'Não autenticado.');
        const agendamento = await agendamento_service_1.default.decide(Number(req.params.id), authUserId, 'recusado');
        res.status(200).json(agendamento);
    });
}
exports.default = AgendamentosController;
