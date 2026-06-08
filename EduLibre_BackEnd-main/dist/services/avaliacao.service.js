"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Avaliacao_1 = __importDefault(require("../models/Avaliacao"));
const Aula_1 = __importDefault(require("../models/Aula"));
const User_1 = __importDefault(require("../models/User"));
const http_error_1 = __importDefault(require("../utils/http-error"));
const validators_1 = require("../utils/validators");
class AvaliacaoService {
    static async create(payload) {
        const aluno = await User_1.default.findByPk(payload.alunoId);
        if (!aluno)
            throw new http_error_1.default(400, 'Utilizador inválido.');
        const aula = await Aula_1.default.findByPk(payload.aulaId);
        if (!aula)
            throw new http_error_1.default(404, 'Aula não encontrada.');
        return Avaliacao_1.default.create({
            aulaId: payload.aulaId,
            alunoId: payload.alunoId,
            nota: (0, validators_1.validateRating)(payload.nota),
            comentario: payload.comentario ? (0, validators_1.requireText)(payload.comentario, 'Comentário') : null,
        });
    }
}
exports.default = AvaliacaoService;
