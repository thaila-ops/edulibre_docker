"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPageRequest = getPageRequest;
exports.buildPage = buildPage;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function parseNumber(value, fallback) {
    return Number.isNaN(Number(value)) ? fallback : Number(value);
}
function getPageRequest(pageValue, sizeValue) {
    const page = clamp(parseNumber(pageValue, DEFAULT_PAGE), 1, Number.MAX_SAFE_INTEGER);
    const pageSize = clamp(parseNumber(sizeValue, DEFAULT_PAGE_SIZE), 1, MAX_PAGE_SIZE);
    return { limit: pageSize, offset: (page - 1) * pageSize, page, pageSize };
}
function buildPage(data, total, page, pageSize) {
    return { data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
