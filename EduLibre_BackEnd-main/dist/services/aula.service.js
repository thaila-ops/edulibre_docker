"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Aula_1 = __importDefault(require("../models/Aula"));
const User_1 = __importDefault(require("../models/User"));
const Avaliacao_1 = __importDefault(require("../models/Avaliacao"));
const Agendamento_1 = __importDefault(require("../models/Agendamento"));
const http_error_1 = __importDefault(require("../utils/http-error"));
const pagination_1 = require("../utils/pagination");
const validators_1 = require("../utils/validators");
const AULA_INCLUDE = [
    { model: User_1.default, as: 'professor', attributes: ['id', 'name', 'email', 'cpf', 'dataNascimento', 'tipo', 'avatarUrl', 'bio'] },
    { model: Avaliacao_1.default, as: 'avaliacoes', include: [{ model: User_1.default, as: 'aluno', attributes: ['id', 'name', 'avatarUrl'] }] },
    { model: Agendamento_1.default, as: 'agendamentos' },
];
class AulaService {
    static async list(filters) {
        const pageRequest = (0, pagination_1.getPageRequest)(filters.page, filters.pageSize);
        const result = await Aula_1.default.findAndCountAll({
            where: AulaService.buildWhere(filters.materia, filters.professorId),
            include: AULA_INCLUDE,
            limit: pageRequest.limit,
            offset: pageRequest.offset,
            order: [['id', 'DESC']],
            distinct: true,
        });
        return (0, pagination_1.buildPage)(result.rows.map((item) => AulaService.serialize(item)), result.count, pageRequest.page, pageRequest.pageSize);
    }
    static async featured() {
        const lessons = await Aula_1.default.findAll({ include: AULA_INCLUDE, limit: 3, order: [['id', 'DESC']] });
        return lessons.map((item) => AulaService.serialize(item));
    }
    static async findById(id) {
        const aula = await Aula_1.default.findByPk(id, { include: AULA_INCLUDE });
        if (!aula)
            throw new http_error_1.default(404, 'Aula nÃ£o encontrada.');
        return AulaService.serialize(aula);
    }
    static async create(payload) {
        await AulaService.ensureProfessor(payload.professorId);
        const aula = await Aula_1.default.create(AulaService.buildPayload(payload));
        return AulaService.findById(aula.id);
    }
    static async update(id, payload) {
        await AulaService.ensureProfessor(payload.professorId);
        const aula = await Aula_1.default.findByPk(id);
        if (!aula)
            throw new http_error_1.default(404, 'Aula nÃ£o encontrada.');
        await aula.update(AulaService.buildPayload(payload));
        return AulaService.findById(aula.id);
    }
    static async remove(id) {
        const aula = await Aula_1.default.findByPk(id);
        if (!aula)
            throw new http_error_1.default(404, 'Aula nÃ£o encontrada.');
        await aula.destroy();
    }
    static buildPayload(payload) {
        return {
            materia: (0, validators_1.requireText)(payload.materia, 'MatÃ©ria'),
            valor: (0, validators_1.validatePositiveNumber)(Number(payload.valor), 'Valor'),
            descricao: payload.descricao?.trim() || null,
            imageUrl: (0, validators_1.validateOptionalUrl)(payload.imageUrl),
            professorId: Number(payload.professorId),
        };
    }
    static buildWhere(materia, professorId) {
        return {
            ...(materia ? { materia: { [sequelize_1.Op.like]: `%${materia.trim()}%` } } : {}),
            ...(professorId ? { professorId: Number(professorId) } : {}),
        };
    }
    static async ensureProfessor(id) {
        const professor = await User_1.default.findByPk(Number(id));
        if (!professor)
            throw new http_error_1.default(400, 'Utilizador invÃ¡lido.');
        (0, validators_1.ensureAdult)(professor.dataNascimento, 'vender aulas');
    }
    static serialize(aula) {
        const plain = aula.toJSON();
        const reviews = plain.avaliacoes ?? [];
        const bookings = plain.agendamentos ?? [];
        const paidBookings = bookings.filter((item) => item.paymentStatus === 'pago');
        const average = reviews.length
            ? reviews.reduce((total, item) => total + item.nota, 0) / reviews.length
            : 0;
        return {
            id: plain.id,
            materia: plain.materia,
            valor: plain.valor,
            descricao: plain.descricao,
            imageUrl: plain.imageUrl,
            professorId: plain.professorId,
            professor: plain.professor,
            reviewCount: reviews.length,
            averageRating: Number(average.toFixed(1)),
            bookingCount: bookings.length,
            paidBookingCount: paidBookings.length,
            avaliacoes: reviews,
        };
    }
}
exports.default = AulaService;
