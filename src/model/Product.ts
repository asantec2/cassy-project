/**
 * The {@code Product} class represents an abstract purchasable item.
 * It stores a product’s name and price,and defines abstract stock-management methods for subclasses.
 */
import {assert} from "../assertions.ts";

export default abstract class Product {
    #name: string;
    #price: number;

    //constructor
    constructor(name: string, price: number) {
        this.#name = name;
        this.#price = price;
        this.#checkProduct();
    }

    //implementation of class invariants
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

    //abstract methods
    abstract getQuantity(): number;
    abstract reduceQuantity(): void;
    abstract increaseQuantity(): void;


}