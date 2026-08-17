import HttpError from './http-error';
import { UserRole } from '../types/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CPF_REGEX = /^\d{11}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const DATA_IMAGE_URL_REGEX = /^data:image\/(?:png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i;

function cleanValue(value: string) {
  return value.trim();
}

export function requireText(value: string | undefined, field: string) {
  const cleaned = cleanValue(value ?? '');
  if (!cleaned) throw new HttpError(400, `${field}  é obrigatório.`);
  return cleaned;
}

export function validateEmail(email: string) {
  if (!EMAIL_REGEX.test(email)) throw new HttpError(400, 'E-mail invalido.');
  return email.toLowerCase();
}

export function validateCpf(cpf: string) {
  const cleaned = cpf.replace(/\D/g, '');
  if (!CPF_REGEX.test(cleaned)) {
    throw new HttpError(400, 'CPF invalido. Use 11 digitos.');
  }
  return cleaned;
}

export function validatePassword(password: string) {
  const normalizedPassword = password.trim();
  if (!PASSWORD_REGEX.test(normalizedPassword)) throw new HttpError(400, 'A senha deve ter 8+ caracteres, letra, numero e simbolo.');
  return normalizedPassword;
}

export function validateRole(tipo: string | undefined) {
  if (!tipo) return 'usuario';
  if (tipo !== 'usuario' && tipo !== 'admin') throw new HttpError(400, 'Tipo invalido.');
  return tipo as UserRole;
}

export function validatePositiveNumber(value: number, field: string) {
  if (!Number.isFinite(value) || value <= 0) throw new HttpError(400, `${field} deve ser maior que zero.`);
  return value;
}

export function validateDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new HttpError(400, 'Data invalida.');
  return date;
}

export function validateBirthDate(value: string | undefined) {
  const requiredValue = requireText(value, 'Data de nascimento');
  const date = validateDate(requiredValue);
  if (date > new Date()) throw new HttpError(400, 'Data de nascimento invalida.');
  return date;
}

function normalizeDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

export function isAdult(date: Date | string, minimumAge = 18) {
  const parsedDate = normalizeDate(date);
  const today = new Date();
  let age = today.getFullYear() - parsedDate.getFullYear();
  const hasNotHadBirthdayYet =
    today.getMonth() < parsedDate.getMonth()
    || (today.getMonth() === parsedDate.getMonth() && today.getDate() < parsedDate.getDate());

  if (hasNotHadBirthdayYet) age -= 1;
  return age >= minimumAge;
}

export function ensureAdult(date: Date | string | null | undefined, action: string) {
  if (!date) {
    throw new HttpError(403, `Informe a data de nascimento antes de ${action}.`);
  }

  if (!isAdult(date)) {
    throw new HttpError(403, `Apenas maiores de 18 anos podem ${action}.`);
  }
}

export function validateOptionalUrl(value: string | undefined) {
  if (!value || !value.trim()) return null;
  const normalizedValue = value.trim();
  if (DATA_IMAGE_URL_REGEX.test(normalizedValue)) return normalizedValue;
  try {
    return new URL(normalizedValue).toString();
  } catch {
    throw new HttpError(400, 'URL de imagem invÃ¡lida.');
  }
}

export function validateRating(value: number) {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpError(400, 'A nota deve ser um numero inteiro entre 1 e 5.');
  }
  return rating;
}
