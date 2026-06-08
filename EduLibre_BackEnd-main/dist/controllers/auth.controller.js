"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_handler_1 = __importDefault(require("../utils/async-handler"));
const user_service_1 = __importDefault(require("../services/user.service"));
const token_service_1 = __importDefault(require("../services/token.service"));
class AuthController {
    static health = (_req, res) => {
        res.status(200).json({ message: 'EduLivre API' });
    };
    static login = (0, async_handler_1.default)(async (req, res) => {
        const user = await user_service_1.default.authenticate(req.body.email, req.body.password);
        const token = token_service_1.default.sign({ id: user.id, email: user.email, tipo: user.tipo });
        res.status(200).json({ message: 'Usuário autenticado.', token, user });
    });
    static me = (0, async_handler_1.default)(async (req, res) => {
        const user = await user_service_1.default.findById(req.authUser.id);
        res.status(200).json(user);
    });
}
exports.default = AuthController;
