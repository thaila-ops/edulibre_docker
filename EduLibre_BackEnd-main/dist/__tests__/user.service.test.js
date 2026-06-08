"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_service_1 = __importDefault(require("../services/user.service"));
const User_1 = __importDefault(require("../models/User"));
const http_error_1 = __importDefault(require("../utils/http-error"));
jest.mock('bcrypt');
jest.mock('../models/User');
const mockedBcrypt = jest.mocked(bcrypt_1.default);
const mockedUser = jest.mocked(User_1.default);
describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('creates user with encrypted password', async () => {
        mockedUser.findOne.mockResolvedValue(null);
        mockedBcrypt.hash.mockResolvedValue('hash');
        mockedUser.create.mockResolvedValue({
            id: 1,
            name: 'Ana',
            email: 'ana@teste.com',
            cpf: '12345678901',
            dataNascimento: new Date('1990-05-10'),
            tipo: 'usuario',
            avatarUrl: null,
            bio: null,
        });
        const user = await user_service_1.default.create({
            name: 'Ana',
            email: 'ana@teste.com',
            password: 'Senha@123',
            cpf: '12345678901',
            dataNascimento: '1990-05-10',
            tipo: 'usuario',
        });
        expect(user.email).toBe('ana@teste.com');
        expect(mockedBcrypt.hash).toHaveBeenCalledWith('Senha@123', 10);
    });
    test('rejects weak password on create', async () => {
        await expect(user_service_1.default.create({
            name: 'Ana',
            email: 'ana@teste.com',
            password: '123',
            cpf: '12345678901',
            dataNascimento: '1990-05-10',
            tipo: 'usuario',
        })).rejects.toBeInstanceOf(http_error_1.default);
    });
    test('prevents email change on update', async () => {
        await expect(user_service_1.default.update(1, {
            name: 'Ana',
            cpf: '12345678901',
            dataNascimento: '1990-05-10',
            tipo: 'usuario',
            email: 'novo@teste.com',
        })).rejects.toThrow('O e-mail não pode ser alterado.');
    });
    test('authenticates only existing users with valid password', async () => {
        mockedUser.findOne.mockResolvedValue({
            id: 1,
            name: 'Ana',
            email: 'ana@teste.com',
            cpf: '12345678901',
            dataNascimento: new Date('1990-05-10'),
            tipo: 'usuario',
            password: 'hash',
            avatarUrl: null,
            bio: null,
        });
        mockedBcrypt.compare.mockResolvedValue(true);
        const user = await user_service_1.default.authenticate('ana@teste.com', 'Senha@123');
        expect(user.id).toBe(1);
        expect(mockedBcrypt.compare).toHaveBeenCalledWith('Senha@123', 'hash');
    });
});
