import  Receipt from "./Receipt.ts";
import {assert} from "../assertions.ts";
import db from './connection.ts'


export default  class Cashier {
    #username : string;
    #password : string;
    #receipts : Array<Receipt>;



    constructor(username:string,password:string) {
        if (username.length === 0  || username.length >= 15){
            throw new InvalidUsernameException();
        }
        if(/^[a-zA-Z]+$/.test(username)){
            throw new InvalidNumericUsernameException();
        }
        if(password.length === 0){
            throw new InvalidPasswordException();
        }
        this.#username = username;
        this.#password = password;
        this.#receipts = new Array<Receipt>();
        Cashier.saveCashier(this);
        this.#checkCashier();
    }
    #checkCashier() {
        assert(this.#username.length >= 1, "username must contain at least one character");
        assert(this.#password.length >= 1, "password must contain at least one character");
    }
    static async saveCashier(cashier : Cashier):Promise<Cashier>{
        await db().query<{
            username : string,
            password : string
        }>("insert into cashier(username,password) values($1,$2) on conflict do nothing returning username",
        [cashier.getUserName(),cashier.getPassword()]);


        return  cashier

    }

    static async getAllCashiers():Promise<Array<Cashier>>{
        const  allCashiers = new Array<Cashier>();
        let results = await db()
            .query<{ username:string, password:string }>("select username,password from cashier");
        for (let row of results.rows){
            let cashier = new Cashier(row.username, row.password)
            allCashiers.push(cashier);
        }
        return allCashiers;
    }
    static async getCashierByUsername(username: string): Promise<Cashier> {
        const result = await db().query<
            {
                username: string,
                password: string
            }
        >(
            "select username, password from cashier where username = $1",
            [username]
        );

        const row = result.rows[0];
        return new Cashier(row.username, row.password);
    }
    getReceipts(){
        return this.#receipts;
    }
    getPassword(){
        return  this.#password;
    }
    getUserName(){
        return this.#username
    }

    addReceipt(receipt: Receipt){
        this.#receipts.push(receipt);
    }
}
export class InvalidUsernameException extends Error {}
export class InvalidPasswordException extends Error {}
export class InvalidNumericUsernameException extends Error{}
