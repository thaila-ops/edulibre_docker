import { Produto } from '../models/Produto';

describe('Produto', () => {
  test('calculates discount', () => {
    const produto = new Produto('Iphone 17', 8000);
    expect(produto.calcularDesconto(10)).toBe(7200);
    expect(produto.calcularDesconto(20)).toBe(6400);
  });

  test('rejects negative discount', () => {
    const produto = new Produto('Iphone 17', 8000);
    expect(() => produto.calcularDesconto(-10)).toThrow('Percentual de desconto deve estar entre 0 e 100.');
  });

  test('rejects discount over hundred', () => {
    const produto = new Produto('Iphone 17', 8000);
    expect(() => produto.calcularDesconto(150)).toThrow('Percentual de desconto deve estar entre 0 e 100.');
  });
});
