"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const avaliacao_service_1 = __importDefault(require("../services/avaliacao.service"));
const async_handler_1 = __importDefault(require("../utils/async-handler"));
class AvaliacoesController {
    static create = (0, async_handler_1.default)(async (req, res) => {
        const avaliacao = await avaliacao_service_1.default.create(req.body);
        res.status(201).json(avaliacao);
    });
}
exports.default = AvaliacoesController;
