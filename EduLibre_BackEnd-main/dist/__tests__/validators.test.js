"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validators_1 = require("../utils/validators");
describe('Validators', () => {
    test('validates email format', () => {
        expect(() => (0, validators_1.validateEmail)('email-invalido')).toThrow('E-mail invÃ¡lido.');
    });
    test('validates cpf format', () => {
        expect(() => (0, validators_1.validateCpf)('123')).toThrow('CPF invÃ¡lido. Use 11 dÃ­gitos.');
    });
    test('validates password strength', () => {
        expect(() => (0, validators_1.validatePassword)('senhafraca')).toThrow('A senha deve ter 8+ caracteres, letra, nÃºmero e sÃ­mbolo.');
    });
    test('validates role values', () => {
        expect(() => (0, validators_1.validateRole)('admin')).toThrow('Tipo invÃ¡lido.');
    });
    test('rejects birth date in the future', () => {
        expect(() => (0, validators_1.validateBirthDate)('2999-01-01')).toThrow('Data de nascimento invÃ¡lida.');
    });
    test('rejects underage users for adult actions', () => {
        expect(() => (0, validators_1.ensureAdult)(new Date('2010-01-01'), 'comprar aulas')).toThrow('Apenas maiores de 18 anos podem comprar aulas.');
    });
    test('requires birth date before adult actions', () => {
        expect(() => (0, validators_1.ensureAdult)(null, 'comprar aulas')).toThrow('Informe a data de nascimento antes de comprar aulas.');
    });
});
