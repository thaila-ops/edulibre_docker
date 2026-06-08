import { PaginationResult } from '../types/api';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

export type PageRequest = {
  limit: number;
  offset: number;
  page: number;
  pageSize: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseNumber(value: string | undefined, fallback: number) {
  return Number.isNaN(Number(value)) ? fallback : Number(value);
}

export function getPageRequest(pageValue?: string, sizeValue?: string): PageRequest {
  const page = clamp(parseNumber(pageValue, DEFAULT_PAGE), 1, Number.MAX_SAFE_INTEGER);
  const pageSize = clamp(parseNumber(sizeValue, DEFAULT_PAGE_SIZE), 1, MAX_PAGE_SIZE);
  return { limit: pageSize, offset: (page - 1) * pageSize, page, pageSize };
}

export function buildPage<T>(data: T[], total: number, page: number, pageSize: number): PaginationResult<T> {
  return { data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
