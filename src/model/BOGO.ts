// @ts-ignore
import Coupon from "./Coupon.ts";
import type Cart from "./Cart.ts";
import {assert} from "../assertions.ts";
import db from "./connection.ts";

export default class BOGO implements Coupon {
    #name : string;
    #description: string;

    constructor(name: string,description: string) {
        this.#description = description;
        this.#name = name;
        this.#checkBOGO();
    }

    //implementation of class invariants
    #checkBOGO() {
        assert(this.#name.length >= 1, "name must contain at least one character");
        assert(this.#description.length >= 1, "description must contain at least one character");
    }
    getName(){
        return this.#name;
    }
    getDescription(){
        return this.#description;
    }
    static async saveCoupon(coupon : BOGO)  :Promise<BOGO>{
        await db().query<{
            name : string,
            description: string
        }>( "insert into coupon(name,description) values ($1,$2) on conflict do nothing returning name",
            [coupon.getName(),coupon.getDescription()]);
        return coupon;
    }
    static async getCouponByName(name: string): Promise<BOGO> {
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
        return new BOGO(row.name, row.description);
    }

    static async getAllCoupons():Promise<Array<BOGO>>{
        const  allCoupons = new Array<BOGO>();
        let results = await db()
            .query<{ name:string, description :string }>("select name, description from coupon");
        for (let row of results.rows){
            let coupon = new BOGO(row.name, row.description)
            allCoupons.push(coupon);
        }
        return allCoupons;
    }
    applyCoupon(cart: Cart) {

        let smoothie = 0;
        let juice = 0;
        let froyo = 0;

        for (const item of cart.getItems()) {
            if (item.getName() === "Strawberry Sunshine") {
                smoothie++;
            } else if (item.getName() === "Orange Juice") {
                juice++;
            } else if (item.getName() === "Vanilla Froyo") {
              froyo++;
            }
        }

        let freeSmoothie = Math.floor(smoothie / 2);
        let freeJuice = Math.floor(juice / 2);
        let freeFroyo = Math.floor(froyo / 2);


        for (const item of cart.getItems()) {

            if (item.getName() === "Strawberry Sunshine" && freeSmoothie > 0) {
                item.setPrice(0);
                freeSmoothie--;
            }

            else if (item.getName() === "Orange Juice" && freeJuice > 0) {
                item.setPrice(0);
                freeJuice--;
            }

            else if (item.getName() === "Vanilla Froyo" && freeFroyo > 0) {
                item.setPrice(0);
                freeFroyo--;
            }
        }

    }
}
export class InvalidBOGOApplicationException extends Error { }