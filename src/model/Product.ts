import {assert} from "../assertions.ts";

export default abstract class Product {
    #name: string;
    #price: number;

    constructor(name: string, price: number) {
        this.#name = name;
        this.#price = price;
        this.#checkProduct();
    }

    #checkProduct() {
        assert(this.#name.length >= 1, "name must contain at least one character");
        assert(this.#price > 0, "price must be greater than 0");
    }

    getPrice(): number {
        return this.#price;
    }

    getName(): string {
        return this.#name;
    }

}