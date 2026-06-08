"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_service_1 = __importDefault(require("../services/token.service"));
const User_1 = __importDefault(require("../models/User"));
async function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization)
        return res.status(401).json({ message: 'Token não informado.' });
    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token)
        return res.status(401).json({ message: 'Token inválido.' });
    try {
        const payload = token_service_1.default.verify(token);
        const user = await User_1.default.findByPk(payload.id);
        if (!user)
            return res.status(401).json({ message: 'Utilizador autenticado não existe mais.' });
        req.authUser = payload;
        next();
    }
    catch {
        res.status(401).json({ message: 'Token inválido.' });
    }
}
exports.default = authMiddleware;
