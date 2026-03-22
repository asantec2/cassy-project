/**
 * The {@code Percent25} class represents a 25% discount coupon applied to a {@link Cart}.
 * It reduces the total cost of the cart by 25 percent when applied successfully.
 */

import type Coupon from "./Coupon.ts";
import type Cart from "./Cart.ts";
import {assert} from "../assertions.ts";
import db from "./connection.ts";

export default class Percent25 implements Coupon {
    #name: string;
    #description: string;

    //constructor
    constructor(name: string, description: string) {
        this.#description = description;
        this.#name = name;
        this.#checkPercent25();
    }

    //implementation of class invariants
    #checkPercent25() {
        assert(this.#name.length >= 1, "name must contain at least one character");
        assert(this.#description.length >= 1, "description must contain at least one character");
    }

    getName() {
        return this.#name;
    }

    getDescription() {
        return this.#description;
    }

    /**
     * Save coupon by inserting it into database
     * @param coupon the coupon to be saved into database
     */
    static async saveCoupon(coupon: Percent25): Promise<Percent25> {
        await db().query<{
            name: string,
            description: string
        }>("insert into coupon(name,description) values ($1,$2) on conflict do nothing returning name",
            [coupon.getName(), coupon.getDescription()]);
        return coupon;
    }

    /**
     * Gets coupon from database based on name
     * @param name the name we want to get coupon based on
     */
    static async getCouponByName(name: string): Promise<Percent25> {
        const result = await db().query<
            {
                name: string,
                description: string
            }
        >(
            "select name, description from coupon where name = $1",
            [name]
        );

        const row = result.rows[0];
        return new Percent25(row.name, row.description);
    }

    /**
     * Apply percent25 coupon to cart by reducing price by 25%
     * @param cart the cart for coupon to be applied to
     */
    applyCoupon(cart: Cart) {
        let total = cart.getTotal()
        if (total === 0) {
            throw new InvalidPercentApplicationException();
        }
        total = total * 0.75;
        cart.setTotal(Math.round(total));
    }
}

export class InvalidPercentApplicationException extends Error {
}