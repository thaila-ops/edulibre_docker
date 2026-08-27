"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireText = requireText;
exports.validateEmail = validateEmail;
exports.validateCpf = validateCpf;
exports.validatePassword = validatePassword;
exports.validateRole = validateRole;
exports.validatePositiveNumber = validatePositiveNumber;
exports.validateDate = validateDate;
exports.validateBirthDate = validateBirthDate;
exports.isAdult = isAdult;
exports.ensureAdult = ensureAdult;
exports.validateOptionalUrl = validateOptionalUrl;
exports.validateRating = validateRating;
const http_error_1 = __importDefault(require("./http-error"));
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CPF_REGEX = /^\d{11}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const DATA_IMAGE_URL_REGEX = /^data:image\/(?:png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i;
function cleanValue(value) {
    return value.trim();
}
function requireText(value, field) {
    const cleaned = cleanValue(value ?? '');
    if (!cleaned)
        throw new http_error_1.default(400, `${field}  é obrigatório.`);
    return cleaned;
}
function validateEmail(email) {
    if (!EMAIL_REGEX.test(email))
        throw new http_error_1.default(400, 'E-mail invalido.');
    return email.toLowerCase();
}
function validateCpf(cpf) {
    const cleaned = cpf.replace(/\D/g, '');
    if (!CPF_REGEX.test(cleaned)) {
        throw new http_error_1.default(400, 'CPF invalido. Use 11 digitos.');
    }
    return cleaned;
}
function validatePassword(password) {
    const normalizedPassword = password.trim();
    if (!PASSWORD_REGEX.test(normalizedPassword))
        throw new http_error_1.default(400, 'A senha deve ter 8+ caracteres, letra, numero e simbolo.');
    return normalizedPassword;
}
function validateRole(tipo) {
    if (!tipo)
        return 'usuario';
    if (tipo !== 'usuario' && tipo !== 'admin')
        throw new http_error_1.default(400, 'Tipo invalido.');
    return tipo;
}
function validatePositiveNumber(value, field) {
    if (!Number.isFinite(value) || value <= 0)
        throw new http_error_1.default(400, `${field} deve ser maior que zero.`);
    return value;
}
function validateDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        throw new http_error_1.default(400, 'Data invalida.');
    return date;
}
function validateBirthDate(value) {
    const requiredValue = requireText(value, 'Data de nascimento');
    const date = validateDate(requiredValue);
    if (date > new Date())
        throw new http_error_1.default(400, 'Data de nascimento invalida.');
    return date;
}
function normalizeDate(value) {
    return value instanceof Date ? value : new Date(value);
}
function isAdult(date, minimumAge = 18) {
    const parsedDate = normalizeDate(date);
    const today = new Date();
    let age = today.getFullYear() - parsedDate.getFullYear();
    const hasNotHadBirthdayYet = today.getMonth() < parsedDate.getMonth()
        || (today.getMonth() === parsedDate.getMonth() && today.getDate() < parsedDate.getDate());
    if (hasNotHadBirthdayYet)
        age -= 1;
    return age >= minimumAge;
}
function ensureAdult(date, action) {
    if (!date) {
        throw new http_error_1.default(403, `Informe a data de nascimento antes de ${action}.`);
    }
    if (!isAdult(date)) {
        throw new http_error_1.default(403, `Apenas maiores de 18 anos podem ${action}.`);
    }
}
function validateOptionalUrl(value) {
    if (!value || !value.trim())
        return null;
    const normalizedValue = value.trim();
    if (DATA_IMAGE_URL_REGEX.test(normalizedValue))
        return normalizedValue;
    try {
        return new URL(normalizedValue).toString();
    }
    catch {
        throw new http_error_1.default(400, 'URL de imagem invÃ¡lida.');
    }
}
function validateRating(value) {
    const rating = Number(value);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new http_error_1.default(400, 'A nota deve ser um numero inteiro entre 1 e 5.');
    }
    return rating;
}
