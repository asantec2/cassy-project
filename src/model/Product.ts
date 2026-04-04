/**
 * The {@code Product} class represents an abstract purchasable item.
 * It stores a product’s name and price,and defines abstract stock-management methods for subclasses.
 */
import {assert} from "../assertions.ts";
import db from "./connection.ts";


export default abstract class Product {
    #name: string;
    #price: number;
    #quantity: number;

    //constructor
    constructor(name: string, price: number, quantity: number) {
        this.#name = name;
        this.#price = price;
        this.#quantity = quantity;
        this.#checkProduct();
    }

    //implementation of class invariants
    #checkProduct() {
        assert(this.#name.length >= 1, "name must contain at least one character");
        assert(this.#price >= 0, "price must be greater than or equal to 0");
        assert(this.#quantity >= 0, "quantity must be greater than or equal to 0");
    }

    /**
     * Save product by inserting it into database
     * @param product product to be saved into database
     */
    static async saveProduct(product: Product): Promise<Product> {
        await db().query(
            `update product
             set quantity = $1
             where name = $2`,
            [
                product.getQuantity(),
                product.getName()
            ]
        );

        return product;
    }
    static async getProductTypeByName(name: string): Promise<string> {
        const result = await db().query<{
            product_type:string
        }>(
            "select product_type from product where name = $1",
            [name]
        );

        return result.rows[0].product_type;
    }

    getPrice(): number {
        return this.#price;
    }

    getName(): string {
        return this.#name;
    }


    getQuantity(): number {
        return this.#quantity;
    }

    /**
     * Reduces the quantity of Product
     */
    reduceQuantity(quantity: number): void {
        this.#quantity = this.#quantity - quantity;
        this.#checkProduct();
    }

}