"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const pagination_1 = require("../utils/pagination");
const http_error_1 = __importDefault(require("../utils/http-error"));
const validators_1 = require("../utils/validators");
class UserService {
    static async list(params) {
        const pageRequest = (0, pagination_1.getPageRequest)(params.page, params.pageSize);
        const result = await User_1.default.findAndCountAll({
            attributes: { exclude: ['password'] },
            limit: pageRequest.limit,
            offset: pageRequest.offset,
            order: [['id', 'ASC']],
        });
        return (0, pagination_1.buildPage)(result.rows.map(UserService.toAuthUser), result.count, pageRequest.page, pageRequest.pageSize);
    }
    static async findById(id) {
        const user = await User_1.default.findByPk(id);
        if (!user)
            throw new http_error_1.default(404, 'Usuário não encontrado.');
        return UserService.toAuthUser(user);
    }
    static async create(payload) {
        const email = (0, validators_1.validateEmail)((0, validators_1.requireText)(payload.email, 'E-mail'));
        const cpf = (0, validators_1.validateCpf)((0, validators_1.requireText)(payload.cpf, 'CPF'));
        const userExists = await User_1.default.findOne({ where: { email } });
        if (userExists)
            throw new http_error_1.default(409, 'Já existe utilizador com este e-mail.');
        const userWithCpf = await User_1.default.findOne({ where: { cpf } });
        if (userWithCpf)
            throw new http_error_1.default(409, 'Já existe utilizador com este CPF.');
        const user = await User_1.default.create(await UserService.buildCreatePayload(payload));
        return UserService.toAuthUser(user);
    }
    static async update(id, payload) {
        if (payload.email)
            throw new http_error_1.default(400, 'O e-mail não pode ser alterado.');
        const user = await User_1.default.findByPk(id);
        if (!user)
            throw new http_error_1.default(404, 'Usuário não encontrado.');
        const cpf = (0, validators_1.validateCpf)((0, validators_1.requireText)(payload.cpf, 'CPF'));
        const userWithCpf = await User_1.default.findOne({ where: { cpf } });
        if (userWithCpf && userWithCpf.id !== id)
            throw new http_error_1.default(409, 'Já existe utilizador com este CPF.');
        await user.update(await UserService.buildUpdatePayload(payload, user.tipo));
        return UserService.toAuthUser(user);
    }
    static async remove(id) {
        const user = await User_1.default.findByPk(id);
        if (!user)
            throw new http_error_1.default(404, 'Usuário não encontrado.');
        await user.destroy();
    }
    static async setRole(id, tipo) {
        const user = await User_1.default.findByPk(id);
        if (!user)
            throw new http_error_1.default(404, 'Usuário não encontrado.');
        await user.update({ tipo });
        return UserService.toAuthUser(user);
    }
    static async authenticate(emailValue, passwordValue) {
        const email = (0, validators_1.validateEmail)((0, validators_1.requireText)(emailValue, 'E-mail'));
        const password = (0, validators_1.requireText)(passwordValue, 'Senha');
        const user = await User_1.default.findOne({ where: { email } });
        if (!user)
            throw new http_error_1.default(401, 'Usuário ou senha inválidos.');
        const matches = await bcrypt_1.default.compare(password, user.password);
        if (!matches)
            throw new http_error_1.default(401, 'Usuário ou senha inválidos.');
        return UserService.toAuthUser(user);
    }
    static async buildCreatePayload(payload) {
        const password = (0, validators_1.validatePassword)((0, validators_1.requireText)(payload.password, 'Senha'));
        const dataNascimento = (0, validators_1.validateBirthDate)(payload.dataNascimento);
        return {
            name: (0, validators_1.requireText)(payload.name, 'Nome'),
            email: (0, validators_1.validateEmail)((0, validators_1.requireText)(payload.email, 'E-mail')),
            cpf: (0, validators_1.validateCpf)((0, validators_1.requireText)(payload.cpf, 'CPF')),
            dataNascimento,
            tipo: 'usuario',
            avatarUrl: (0, validators_1.validateOptionalUrl)(payload.avatarUrl),
            bio: payload.bio?.trim() || null,
            password: await bcrypt_1.default.hash(password, 10),
        };
    }
    static async buildUpdatePayload(payload, currentTipo) {
        const dataNascimento = (0, validators_1.validateBirthDate)(payload.dataNascimento);
        const updateData = {
            name: (0, validators_1.requireText)(payload.name, 'Nome'),
            cpf: (0, validators_1.validateCpf)((0, validators_1.requireText)(payload.cpf, 'CPF')),
            dataNascimento,
            tipo: currentTipo,
            avatarUrl: (0, validators_1.validateOptionalUrl)(payload.avatarUrl),
            bio: payload.bio?.trim() || null,
            password: undefined,
        };
        if (!payload.password)
            return updateData;
        updateData.password = await bcrypt_1.default.hash((0, validators_1.validatePassword)(payload.password), 10);
        return updateData;
    }
    static toAuthUser(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            cpf: user.cpf,
            dataNascimento: user.dataNascimento,
            tipo: user.tipo,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
        };
    }
}
exports.default = UserService;
