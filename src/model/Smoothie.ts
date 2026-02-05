import Product from "./Product.ts";

export default class Smoothie extends Product {
    constructor(name: string, price: number) {
        super(name, price);
    }
}