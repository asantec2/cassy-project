/**
 * The {@code Juice} class represents a juice
 * product available for purchase which is one of the two types of product.
 */
import Product from "./Product.ts";
import {assert} from "vitest";

export default class Juice extends Product {
    //quantity of juice in stock
    static #stock = 15;

    //constructor
    constructor(name: string, price: number) {
        super(name, price);
        this.#checkJuice();
    }
    //implementation of class invariants
    #checkJuice(){
        assert(Juice.#stock >= 0,"stock should be greater than or equal to 0");
    }
    getQuantity(): number {
        return Juice.#stock;
    }

    /**
     * Reduces the quantity of stock of Juice by one
     */
    reduceQuantity(): void {
        Juice.#stock--;
        this.#checkJuice();
    }

    /**
     * Increases the quantity of stock of Juice by one
     */
    increaseQuantity(): void {
        Juice.#stock++;
        this.#checkJuice();
    }

}