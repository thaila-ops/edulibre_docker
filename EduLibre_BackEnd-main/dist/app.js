"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const sequelize_1 = require("sequelize");
const auth_controller_1 = __importDefault(require("./controllers/auth.controller"));
const avaliacoes_controller_1 = __importDefault(require("./controllers/avaliacoes.controller"));
const aulas_controller_1 = __importDefault(require("./controllers/aulas.controller"));
const agendamentos_controller_1 = __importDefault(require("./controllers/agendamentos.controller"));
const users_controller_1 = __importDefault(require("./controllers/users.controller"));
const admin_controller_1 = __importDefault(require("./controllers/admin.controller"));
const auth_middleware_1 = __importDefault(require("./middlewares/auth.middleware"));
const permission_middleware_1 = require("./middlewares/permission.middleware");
const http_error_1 = __importDefault(require("./utils/http-error"));
const app = (0, express_1.default)();
app.set('trust proxy', 1);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(express_1.default.json({ limit: '5mb' }));
app.use((0, cors_1.default)({ origin: ['http://localhost:3000', 'https://edulibre.local'], credentials: false }));
app.use(limiter);
app.get('/', auth_controller_1.default.health);
app.post('/login', auth_controller_1.default.login);
app.get('/auth/me', auth_middleware_1.default, auth_controller_1.default.me);
app.post('/usuarios', users_controller_1.default.create);
app.get('/usuarios', auth_middleware_1.default, (0, permission_middleware_1.requirePermission)('usuarios.listar'), users_controller_1.default.findAll);
app.get('/usuarios/me', auth_middleware_1.default, users_controller_1.default.profile);
app.post('/usuarios/me/tornar-professor', auth_middleware_1.default, users_controller_1.default.tornarProfessor);
app.get('/usuarios/:id', auth_middleware_1.default, users_controller_1.default.getById);
app.put('/usuarios/:id', auth_middleware_1.default, users_controller_1.default.update);
app.delete('/usuarios/:id', auth_middleware_1.default, users_controller_1.default.remove);
app.patch('/usuarios/:id/promover', auth_middleware_1.default, (0, permission_middleware_1.requirePermission)('usuarios.papel.gerenciar'), admin_controller_1.default.promote);
app.patch('/usuarios/:id/rebaixar', auth_middleware_1.default, (0, permission_middleware_1.requirePermission)('usuarios.papel.gerenciar'), admin_controller_1.default.demote);
app.patch('/usuarios/:id/papeis', auth_middleware_1.default, (0, permission_middleware_1.requirePermission)('usuarios.papel.gerenciar'), admin_controller_1.default.grantRole);
app.delete('/usuarios/:id/papeis/:role', auth_middleware_1.default, (0, permission_middleware_1.requirePermission)('usuarios.papel.gerenciar'), admin_controller_1.default.revokeRole);
app.get('/aulas', aulas_controller_1.default.findAll);
app.get('/aulas/destaque', aulas_controller_1.default.featured);
app.post('/aulas', auth_middleware_1.default, (0, permission_middleware_1.requirePermission)('aulas.criar'), aulas_controller_1.default.create);
app.get('/aulas/:id', aulas_controller_1.default.getById);
app.put('/aulas/:id', auth_middleware_1.default, (0, permission_middleware_1.requirePermission)('aulas.editar_propria'), aulas_controller_1.default.update);
app.delete('/aulas/:id', auth_middleware_1.default, (0, permission_middleware_1.requirePermission)('aulas.excluir_propria'), aulas_controller_1.default.remove);
app.post('/aulas/:id/avaliacoes', auth_middleware_1.default, avaliacoes_controller_1.default.create);
app.patch('/aulas/:id/bloquear', auth_middleware_1.default, (0, permission_middleware_1.requirePermission)('aulas.bloquear'), aulas_controller_1.default.block);
app.patch('/aulas/:id/desbloquear', auth_middleware_1.default, (0, permission_middleware_1.requirePermission)('aulas.desbloquear'), aulas_controller_1.default.unblock);
app.get('/admin/dashboard', auth_middleware_1.default, (0, permission_middleware_1.requirePermission)('admin.dashboard.visualizar'), admin_controller_1.default.dashboard);
app.get('/admin/aulas', auth_middleware_1.default, (0, permission_middleware_1.requirePermission)('aulas.gerenciar_qualquer'), aulas_controller_1.default.findAllAdmin);
app.get('/agendamentos', auth_middleware_1.default, agendamentos_controller_1.default.findAll);
app.post('/agendamentos', auth_middleware_1.default, (0, permission_middleware_1.requirePermission)('aulas.contratar'), agendamentos_controller_1.default.create);
app.get('/agendamentos/:id', auth_middleware_1.default, agendamentos_controller_1.default.getById);
app.put('/agendamentos/:id', auth_middleware_1.default, agendamentos_controller_1.default.update);
app.patch('/agendamentos/:id/aceitar', auth_middleware_1.default, agendamentos_controller_1.default.accept);
app.patch('/agendamentos/:id/recusar', auth_middleware_1.default, agendamentos_controller_1.default.reject);
app.patch('/agendamentos/:id/pagar', auth_middleware_1.default, agendamentos_controller_1.default.pay);
app.delete('/agendamentos/:id', auth_middleware_1.default, agendamentos_controller_1.default.remove);
app.use((error, _req, res, _next) => {
    console.error('ERRO CAPTURADO:', error.message, error.stack);
    if (error instanceof http_error_1.default) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof sequelize_1.UniqueConstraintError) {
        return res.status(409).json({ message: 'Já existe um registo com estes dados.' });
    }
    return res.status(500).json({ message: 'Erro interno do servidor.' });
});
exports.default = app;
