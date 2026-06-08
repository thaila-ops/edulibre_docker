export class Produto {
    constructor(private nome: string, private preco: number) {
    }

    public calcularDesconto(percentual: number): number {
        if (percentual < 0 || percentual > 100) {
            throw new Error("Percentual de desconto deve estar entre 0 e 100.");
        }

        return this.preco - (this.preco * (percentual / 100));
    }

    public getNome(): string {
        return this.nome;
    }

    public getPreco(): number {
        return this.preco;
    }

}