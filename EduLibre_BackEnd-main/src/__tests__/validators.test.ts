import {
  ensureAdult,
  validateBirthDate,
  validateCpf,
  validateEmail,
  validatePassword,
  validateRole,
  validateFutureDate,
  validatePositiveNumber,
} from '../utils/validators';

describe('Validators', () => {
  test('validates email format', () => {
    expect(() => validateEmail('email-invalido')).toThrow('E-mail invalido.');
  });

  test('validates cpf format', () => {
    expect(() => validateCpf('123')).toThrow('CPF invalido. Use 11 digitos.');
  });

  test('validates password strength', () => {
    expect(() => validatePassword('senhafraca')).toThrow(
      'A senha deve ter 8+ caracteres, letra, numero e simbolo.',
    );
  });

  test('validates role values', () => {
    expect(() => validateRole('admin')).not.toThrow();
    expect(() => validateRole('invalida')).toThrow('Tipo invalido.');
  });

  test('rejects birth date in the future', () => {
    expect(() => validateBirthDate('2999-01-01')).toThrow(
      'Data de nascimento invalida.',
    );
  });

  test('rejects underage users for adult actions', () => {
    expect(() => ensureAdult(new Date('2010-01-01'), 'comprar aulas')).toThrow(
      'Apenas maiores de 18 anos podem comprar aulas.',
    );
  });

  test('requires birth date before adult actions', () => {
    expect(() => ensureAdult(null, 'comprar aulas')).toThrow(
      'Informe a data de nascimento antes de comprar aulas.',
    );
  });

  test('rejects agendamento dates in the past', () => {
    expect(() => validateFutureDate('2020-01-01T10:00:00Z')).toThrow(
      'A data do agendamento não pode estar no passado.',
    );
  });

  test('accepts future agendamento dates', () => {
    expect(() => validateFutureDate('2999-01-01T10:00:00Z')).not.toThrow();
  });

  test('rejects invalid positive identifiers', () => {
    expect(() => validatePositiveNumber(0, 'Aula')).toThrow(
      'Aula deve ser maior que zero.',
    );
  });
});
