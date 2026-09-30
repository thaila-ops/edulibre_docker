"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aula_service_1 = __importDefault(require("../services/aula.service"));
const notificacao_service_1 = __importDefault(require("../services/notificacao.service"));
const async_handler_1 = __importDefault(require("../utils/async-handler"));
const http_error_1 = __importDefault(require("../utils/http-error"));
class AulasController {
    static featured = (0, async_handler_1.default)(async (_req, res) => {
        const aulas = await aula_service_1.default.featured();
        res.status(200).json(aulas);
    });
    static findAll = (0, async_handler_1.default)(async (req, res) => {
        // Rota pública: nunca lista aulas bloqueadas (sem status = AulaService aplica 'ativa').
        const filters = req.query;
        const aulas = await aula_service_1.default.list(filters);
        res.status(200).json(aulas);
    });
    // Rota de admin (protegida por authMiddleware + adminMiddleware em app.ts):
    // aceita ?status=all|ativa|bloqueada pra gerenciar qualquer aula.
    static findAllAdmin = (0, async_handler_1.default)(async (req, res) => {
        const filters = req.query;
        const aulas = await aula_service_1.default.list({ ...filters, status: filters.status ?? 'all' });
        res.status(200).json(aulas);
    });
    static block = (0, async_handler_1.default)(async (req, res) => {
        const aula = await aula_service_1.default.block(Number(req.params.id), req.body.motivo);
        await notificacao_service_1.default.aulaBloqueada({
            userId: aula.professorId,
            aulaId: aula.id,
            materia: aula.materia,
            motivo: aula.motivoBloqueio,
        });
        res.status(200).json(aula);
    });
    static unblock = (0, async_handler_1.default)(async (req, res) => {
        const aula = await aula_service_1.default.unblock(Number(req.params.id));
        await notificacao_service_1.default.aulaDesbloqueada({
            userId: aula.professorId,
            aulaId: aula.id,
            materia: aula.materia,
        });
        res.status(200).json(aula);
    });
    static getById = (0, async_handler_1.default)(async (req, res) => {
        const aula = await aula_service_1.default.findById(Number(req.params.id));
        res.status(200).json(aula);
    });
    static create = (0, async_handler_1.default)(async (req, res) => {
        const imageUrl = req.file
            ? `/uploads/${req.file.filename}`
            : req.body.imageUrl;
        const aula = await aula_service_1.default.create({
            ...req.body,
            imageUrl,
            professorId: req.authUser.id,
        });
        res.status(201).json(aula);
    });
    static update = (0, async_handler_1.default)(async (req, res) => {
        const aulaAtual = await aula_service_1.default.findById(Number(req.params.id));
        if (aulaAtual.professorId !== req.authUser.id) {
            throw new http_error_1.default(403, 'Você só pode editar a própria aula.');
        }
        const imageUrl = req.file
            ? `/uploads/${req.file.filename}`
            : req.body.imageUrl ?? aulaAtual.imageUrl;
        const aula = await aula_service_1.default.update(Number(req.params.id), {
            ...req.body,
            imageUrl,
            professorId: req.authUser.id,
        });
        res.status(200).json(aula);
    });
    static remove = (0, async_handler_1.default)(async (req, res) => {
        const aulaAtual = await aula_service_1.default.findById(Number(req.params.id));
        if (aulaAtual.professorId !== req.authUser.id) {
            throw new http_error_1.default(403, 'Você só pode excluir a própria aula.');
        }
        await aula_service_1.default.remove(Number(req.params.id));
        res.status(204).send();
    });
}
exports.default = AulasController;
