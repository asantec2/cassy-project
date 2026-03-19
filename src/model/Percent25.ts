// @ts-ignore
import Coupon from "./Coupon.ts";
import type Cart from "./Cart.ts";
import {assert} from "../assertions.ts";
import db from "./connection.ts";

export default class Percent25 implements Coupon {
    #name : string;
    #description: string;

    constructor(name: string,description: string) {
        this.#description = description;
        this.#name = name;
        this.#checkPercent25();
    }

    #checkPercent25() {
        assert(this.#name.length >= 1, "name must contain at least one character");
        assert(this.#description.length >= 1, "description must contain at least one character");
    }
    getName(){
        return this.#name;
    }
    getDescription(){
        return this.#description;
    }
    static async saveCoupon(coupon : Percent25)  :Promise<Percent25>{
        await db().query<{
            name : string,
            description: string
        }>( "insert into coupon(name,description) values ($1,$2) on conflict do nothing returning name",
            [coupon.getName(),coupon.getDescription()]);
        return coupon;
    }
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
    static async getAllCoupons():Promise<Array<Percent25>>{

        const  allCoupons = new Array<Percent25>();
        let results = await db()
            .query<{ name:string, description :string }>("select name,description from coupon");
        for (let row of results.rows){
            let coupon = new Percent25(row.name, row.description)
            allCoupons.push(coupon);
        }
        return allCoupons;
    }


    applyCoupon(cart: Cart) {
      let  total  = cart.getTotal()
        if(total === 0){
            throw new InvalidPercentApplicationException();
        }
        total = total  * 0.75;
    }
}
export class InvalidPercentApplicationException extends Error { }