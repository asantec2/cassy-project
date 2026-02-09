import Product from "./Product.ts";

export default class Juice extends Product {
    static #stock = 50;


    constructor(name: string, price: number) {
        super(name, price);
    }
    getQuantity(): number {
        return Juice.#stock;
    }

    reduceQuantity(): void {
        Juice.#stock--;
    }

    increaseQuantity(): void {
        Juice.#stock++;
    }

}