"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Agendamento_1 = __importDefault(require("../models/Agendamento"));
const Aula_1 = __importDefault(require("../models/Aula"));
const User_1 = __importDefault(require("../models/User"));
const Avaliacao_1 = __importDefault(require("../models/Avaliacao"));
const http_error_1 = __importDefault(require("../utils/http-error"));
const pagination_1 = require("../utils/pagination");
const validators_1 = require("../utils/validators");
const AGENDAMENTO_INCLUDE = [
    { model: User_1.default, as: 'aluno', attributes: ['id', 'name', 'email', 'cpf', 'dataNascimento', 'tipo', 'avatarUrl'] },
    {
        model: Aula_1.default,
        as: 'aula',
        include: [
            { model: User_1.default, as: 'professor', attributes: ['id', 'name', 'email', 'cpf', 'dataNascimento', 'tipo', 'avatarUrl'] },
            { model: Avaliacao_1.default, as: 'avaliacoes' },
        ],
    },
];
class AgendamentoService {
    static async list(filters) {
        const pageRequest = (0, pagination_1.getPageRequest)(filters.page, filters.pageSize);
        const result = await Agendamento_1.default.findAndCountAll({
            where: AgendamentoService.buildWhere(filters),
            include: AGENDAMENTO_INCLUDE,
            limit: pageRequest.limit,
            offset: pageRequest.offset,
            order: [['data', 'DESC']],
            distinct: true,
        });
        const filtered = result.rows
            .map((item) => item.toJSON())
            .filter((item) => !filters.professorId || item.aula?.professorId === Number(filters.professorId));
        return (0, pagination_1.buildPage)(filtered, result.count, pageRequest.page, pageRequest.pageSize);
    }
    static async findById(id) {
        const agendamento = await Agendamento_1.default.findByPk(id, { include: AGENDAMENTO_INCLUDE });
        if (!agendamento)
            throw new http_error_1.default(404, 'Agendamento nÃ£o encontrado.');
        return agendamento.toJSON();
    }
    static async create(payload) {
        await AgendamentoService.ensureRelations(payload);
        const agendamento = await Agendamento_1.default.create({
            ...AgendamentoService.buildPayload(payload),
            bookingStatus: 'pendente',
        });
        return AgendamentoService.findById(agendamento.id);
    }
    static async update(id, payload) {
        await AgendamentoService.ensureRelations(payload);
        const agendamento = await Agendamento_1.default.findByPk(id);
        if (!agendamento)
            throw new http_error_1.default(404, 'Agendamento nÃ£o encontrado.');
        await agendamento.update(AgendamentoService.buildPayload(payload));
        return AgendamentoService.findById(agendamento.id);
    }
    static async pay(id, payerUserId) {
        const agendamento = await Agendamento_1.default.findByPk(id, { include: AGENDAMENTO_INCLUDE });
        if (!agendamento)
            throw new http_error_1.default(404, 'Agendamento nÃ£o encontrado.');
        if (agendamento.alunoId !== payerUserId) {
            throw new http_error_1.default(403, 'Somente o aluno dono do agendamento pode pagar.');
        }
        if (agendamento.bookingStatus !== 'aceito') {
            throw new http_error_1.default(400, 'O professor precisa aceitar o agendamento antes do pagamento.');
        }
        const plain = agendamento.toJSON();
        if (plain.aluno?.dataNascimento) {
            (0, validators_1.ensureAdult)(new Date(plain.aluno.dataNascimento), 'comprar aulas');
        }
        await agendamento.update({ paymentStatus: 'pago' });
        return AgendamentoService.findById(id);
    }
    static async decide(id, professorUserId, decision) {
        const agendamento = await Agendamento_1.default.findByPk(id, { include: AGENDAMENTO_INCLUDE });
        if (!agendamento)
            throw new http_error_1.default(404, 'Agendamento nÃ£o encontrado.');
        const plain = agendamento.toJSON();
        if (plain.aula?.professorId !== professorUserId) {
            throw new http_error_1.default(403, 'Somente o professor da aula pode aceitar ou recusar este agendamento.');
        }
        if (agendamento.paymentStatus === 'pago' && decision === 'recusado') {
            throw new http_error_1.default(400, 'Não é possível recusar um agendamento já pago.');
        }
        await agendamento.update({ bookingStatus: decision });
        return AgendamentoService.findById(id);
    }
    static async remove(id) {
        const agendamento = await Agendamento_1.default.findByPk(id);
        if (!agendamento)
            throw new http_error_1.default(404, 'Agendamento nÃ£o encontrado.');
        await agendamento.destroy();
    }
    static buildWhere(filters) {
        return {
            ...(filters.alunoId ? { alunoId: Number(filters.alunoId) } : {}),
            ...(filters.aulaId ? { aulaId: Number(filters.aulaId) } : {}),
        };
    }
    static buildPayload(payload) {
        return {
            alunoId: Number(payload.alunoId),
            aulaId: Number(payload.aulaId),
            data: (0, validators_1.validateDate)(payload.data),
        };
    }
    static async ensureRelations(payload) {
        const aluno = await User_1.default.findByPk(Number(payload.alunoId));
        if (!aluno)
            throw new http_error_1.default(400, 'Utilizador invÃ¡lido.');
        (0, validators_1.ensureAdult)(aluno.dataNascimento, 'comprar aulas');
        const aula = await Aula_1.default.findByPk(Number(payload.aulaId), { include: [{ model: User_1.default, as: 'professor' }] });
        if (!aula)
            throw new http_error_1.default(404, 'Aula nÃ£o encontrada.');
        const plainAula = aula.toJSON();
        if (plainAula.professor?.dataNascimento) {
            (0, validators_1.ensureAdult)(new Date(plainAula.professor.dataNascimento), 'vender aulas');
        }
    }
}
exports.default = AgendamentoService;
