import { ensureAdult, validateBirthDate, validateCpf, validateEmail, validatePassword, validateRole } from '../utils/validators';

describe('Validators', () => {
  test('validates email format', () => {
    expect(() => validateEmail('email-invalido')).toThrow('E-mail invÃ¡lido.');
  });

  test('validates cpf format', () => {
    expect(() => validateCpf('123')).toThrow('CPF invÃ¡lido. Use 11 dÃ­gitos.');
  });

  test('validates password strength', () => {
    expect(() => validatePassword('senhafraca')).toThrow('A senha deve ter 8+ caracteres, letra, nÃºmero e sÃ­mbolo.');
  });

  test('validates role values', () => {
    expect(() => validateRole('admin')).toThrow('Tipo invÃ¡lido.');
  });

  test('rejects birth date in the future', () => {
    expect(() => validateBirthDate('2999-01-01')).toThrow('Data de nascimento invÃ¡lida.');
  });

  test('rejects underage users for adult actions', () => {
    expect(() => ensureAdult(new Date('2010-01-01'), 'comprar aulas')).toThrow('Apenas maiores de 18 anos podem comprar aulas.');
  });

  test('requires birth date before adult actions', () => {
    expect(() => ensureAdult(null, 'comprar aulas')).toThrow('Informe a data de nascimento antes de comprar aulas.');
  });
});
