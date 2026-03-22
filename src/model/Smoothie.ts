/**
 * The {@code Smoothie} class represents a smoothie
 * product available for purchase which is one of the three types of product.
 */
import Product from "./Product.ts";
import db from "./connection.ts"

export default class Smoothie extends Product {



    //constructor
    constructor(name: string, price: number, quantity: number) {
        super(name, price, quantity);

    }

    /**
     * Get smoothie from database based on the name
     * @param name the name of smoothie we want to get from database
     */
    static async getSmoothieByName(name: string): Promise<Smoothie> {
        const result = await db().query<{
            quantity: number;
            name: string;
            price: number;
        }>(
            "select quantity, name, price from product where name = $1",
            [name]
        );

        const row = result.rows[0];
        return new Smoothie(row.name, row.price, row.quantity);
    }

}