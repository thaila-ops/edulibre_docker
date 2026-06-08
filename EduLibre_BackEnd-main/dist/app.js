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
const auth_middleware_1 = __importDefault(require("./middlewares/auth.middleware"));
const http_error_1 = __importDefault(require("./utils/http-error"));
const app = (0, express_1.default)();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(express_1.default.json({ limit: '5mb' }));
app.use((0, cors_1.default)({ origin: ['http://localhost:3000'], credentials: false }));
app.use(limiter);
app.get('/', auth_controller_1.default.health);
app.post('/login', auth_controller_1.default.login);
app.get('/auth/me', auth_middleware_1.default, auth_controller_1.default.me);
app.post('/usuarios', users_controller_1.default.create);
app.get('/usuarios', auth_middleware_1.default, users_controller_1.default.findAll);
app.get('/usuarios/me', auth_middleware_1.default, users_controller_1.default.profile);
app.get('/usuarios/:id', auth_middleware_1.default, users_controller_1.default.getById);
app.put('/usuarios/:id', auth_middleware_1.default, users_controller_1.default.update);
app.delete('/usuarios/:id', auth_middleware_1.default, users_controller_1.default.remove);
app.get('/aulas', aulas_controller_1.default.findAll);
app.get('/aulas/destaque', aulas_controller_1.default.featured);
app.post('/aulas', auth_middleware_1.default, aulas_controller_1.default.create);
app.get('/aulas/:id', aulas_controller_1.default.getById);
app.put('/aulas/:id', auth_middleware_1.default, aulas_controller_1.default.update);
app.delete('/aulas/:id', auth_middleware_1.default, aulas_controller_1.default.remove);
app.post('/aulas/:id/avaliacoes', auth_middleware_1.default, avaliacoes_controller_1.default.create);
app.get('/agendamentos', auth_middleware_1.default, agendamentos_controller_1.default.findAll);
app.post('/agendamentos', auth_middleware_1.default, agendamentos_controller_1.default.create);
app.get('/agendamentos/:id', auth_middleware_1.default, agendamentos_controller_1.default.getById);
app.put('/agendamentos/:id', auth_middleware_1.default, agendamentos_controller_1.default.update);
app.patch('/agendamentos/:id/aceitar', auth_middleware_1.default, agendamentos_controller_1.default.accept);
app.patch('/agendamentos/:id/recusar', auth_middleware_1.default, agendamentos_controller_1.default.reject);
app.patch('/agendamentos/:id/pagar', auth_middleware_1.default, agendamentos_controller_1.default.pay);
app.delete('/agendamentos/:id', auth_middleware_1.default, agendamentos_controller_1.default.remove);
app.use((error, _req, res, _next) => {
    if (error instanceof http_error_1.default) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof sequelize_1.UniqueConstraintError) {
        return res.status(409).json({ message: 'Já existe um registo com estes dados.' });
    }
    return res.status(500).json({ message: 'Erro interno do servidor.' });
});
exports.default = app;
