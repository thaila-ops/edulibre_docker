"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validators_1 = require("../utils/validators");
describe('Validators', () => {
    test('validates email format', () => {
        expect(() => (0, validators_1.validateEmail)('email-invalido')).toThrow('E-mail invalido.');
    });
    test('validates cpf format', () => {
        expect(() => (0, validators_1.validateCpf)('123')).toThrow('CPF invalido. Use 11 digitos.');
    });
    test('validates password strength', () => {
        expect(() => (0, validators_1.validatePassword)('senhafraca')).toThrow('A senha deve ter 8+ caracteres, letra, numero e simbolo.');
    });
    test('validates role values', () => {
        expect(() => (0, validators_1.validateRole)('admin')).not.toThrow();
        expect(() => (0, validators_1.validateRole)('invalida')).toThrow('Tipo invalido.');
    });
    test('rejects birth date in the future', () => {
        expect(() => (0, validators_1.validateBirthDate)('2999-01-01')).toThrow('Data de nascimento invalida.');
    });
    test('rejects underage users for adult actions', () => {
        expect(() => (0, validators_1.ensureAdult)(new Date('2010-01-01'), 'comprar aulas')).toThrow('Apenas maiores de 18 anos podem comprar aulas.');
    });
    test('requires birth date before adult actions', () => {
        expect(() => (0, validators_1.ensureAdult)(null, 'comprar aulas')).toThrow('Informe a data de nascimento antes de comprar aulas.');
    });
});
