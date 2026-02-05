import Product from "./Product.ts";

export default class Juice extends Product{
    constructor(name: string, price: number) {
        super(name, price);
    }
}