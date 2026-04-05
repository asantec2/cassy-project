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
     * Gets all smoothies in database based on type
     * @param type the type of product we want to get product by
     */
    static async getSmoothiesByType(type: string): Promise<Array<Smoothie>> {
        const result = await db().query<{
            quantity: number;
            name: string;
            price: number;
        }>(
            "select quantity, name, price from product where product_type = $1",
            [type]
        );
        const allSmoothies = new Array<Smoothie>();
        for (let row of result.rows) {
            allSmoothies.push(new Smoothie(row.name, row.price, row.quantity));
        }

        return allSmoothies;
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