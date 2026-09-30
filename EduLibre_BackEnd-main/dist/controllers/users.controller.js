"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../services/user.service"));
const async_handler_1 = __importDefault(require("../utils/async-handler"));
const http_error_1 = __importDefault(require("../utils/http-error"));
const rbac_service_1 = __importDefault(require("../services/rbac.service"));
const email_service_1 = __importDefault(require("../services/email.service"));
class UsersController {
    static findAll = (0, async_handler_1.default)(async (req, res) => {
        const users = await user_service_1.default.list(req.query);
        res.status(200).json(users);
    });
    static profile = (0, async_handler_1.default)(async (req, res) => {
        const user = await user_service_1.default.findById(req.authUser.id);
        res.status(200).json(user);
    });
    static getById = (0, async_handler_1.default)(async (req, res) => {
        const user = await user_service_1.default.findById(Number(req.params.id));
        res.status(200).json(user);
    });
    static create = (0, async_handler_1.default)(async (req, res) => {
        const user = await user_service_1.default.create(req.body);
        await rbac_service_1.default.grantRole(user.id, 'aluno');
        try {
            await email_service_1.default.sendWelcomeEmail({
                name: user.name,
                email: user.email,
            });
        }
        catch (error) {
            console.error('Falha ao enviar e-mail de boas-vindas:', error);
        }
        res.status(201).json(user);
    });
    static update = (0, async_handler_1.default)(async (req, res) => {
        const targetUserId = Number(req.params.id);
        const authUserId = req.authUser?.id;
        if (!authUserId) {
            throw new http_error_1.default(401, 'Não autenticado.');
        }
        if (authUserId !== targetUserId) {
            throw new http_error_1.default(403, 'Você só pode editar o próprio perfil.');
        }
        const avatarUrl = req.file
            ? `/uploads/${req.file.filename}`
            : req.body.avatarUrl;
        const user = await user_service_1.default.update(targetUserId, {
            ...req.body,
            avatarUrl,
        });
        res.status(200).json(user);
    });
    static remove = (0, async_handler_1.default)(async (req, res) => {
        const targetUserId = Number(req.params.id);
        const authUserId = req.authUser?.id;
        if (!authUserId)
            throw new http_error_1.default(401, 'Não autenticado.');
        if (authUserId !== targetUserId) {
            throw new http_error_1.default(403, 'Você só pode remover o próprio perfil.');
        }
        await rbac_service_1.default.ensureUserCanBeDeleted(targetUserId);
        await user_service_1.default.remove(targetUserId);
        res.status(204).send();
    });
    static tornarProfessor = (0, async_handler_1.default)(async (req, res) => {
        const context = await rbac_service_1.default.grantRole(req.authUser.id, 'professor');
        res.status(200).json(context);
    });
}
exports.default = UsersController;
