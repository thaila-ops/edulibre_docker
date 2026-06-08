"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Produto = void 0;
class Produto {
    nome;
    preco;
    constructor(nome, preco) {
        this.nome = nome;
        this.preco = preco;
    }
    calcularDesconto(percentual) {
        if (percentual < 0 || percentual > 100) {
            throw new Error("Percentual de desconto deve estar entre 0 e 100.");
        }
        return this.preco - (this.preco * (percentual / 100));
    }
    getNome() {
        return this.nome;
    }
    getPreco() {
        return this.preco;
    }
}
exports.Produto = Produto;
