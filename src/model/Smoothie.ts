import Product from "./Product.ts";

export default class Smoothie extends Product {
    static #stock = 30;
    constructor(name: string, price: number) {
        super(name, price);
    }

    getQuantity(): number {
        return Smoothie.#stock;
    }

    reduceQuantity(): void {
        Smoothie.#stock--;
    }

    increaseQuantity(): void {
        Smoothie.#stock++;
    }
}