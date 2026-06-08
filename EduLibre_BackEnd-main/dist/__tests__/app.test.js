"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const user_service_1 = __importDefault(require("../services/user.service"));
const token_service_1 = __importDefault(require("../services/token.service"));
jest.mock('../services/user.service');
jest.mock('../services/token.service');
const mockedUserService = jest.mocked(user_service_1.default);
const mockedTokenService = jest.mocked(token_service_1.default);
describe('App routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('GET / returns api health', async () => {
        const response = await (0, supertest_1.default)(app_1.default).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('EduLivre API');
    });
    test('POST /login returns token for valid user', async () => {
        mockedUserService.authenticate.mockResolvedValue({
            id: 1,
            name: 'Ana',
            email: 'ana@teste.com',
            cpf: '12345678901',
            dataNascimento: new Date('1990-05-10'),
            tipo: 'usuario',
            avatarUrl: null,
            bio: null,
        });
        mockedTokenService.sign.mockReturnValue('token-jwt');
        const response = await (0, supertest_1.default)(app_1.default).post('/login').send({
            email: 'ana@teste.com',
            password: 'Senha@123',
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBe('token-jwt');
        expect(response.body.user.email).toBe('ana@teste.com');
    });
    test('GET /usuarios requires authentication', async () => {
        const response = await (0, supertest_1.default)(app_1.default).get('/usuarios');
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Token não informado.');
    });
});
