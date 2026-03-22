/**
 * The {@code CashierController} class manages authentication and account creation for {@link Cashier} users.
 * It handles sign-in and account creation requests from the views, validates user credentials,
 * and coordinates interactions between the views and the underlying data model.
 */

import Cashier from "../model/Cashier.ts";
import CreateCashierView from "../View/CreateCashierView.ts";
import SignInView from "../View/SignInView.ts";
import CartController from "./CartController.ts";
import Cart from "../model/Cart.ts";

export default class CashierController {
    #cashier?: Cashier;
    // @ts-ignore
    #createCashierView?: CreateCashierView;
    // @ts-ignore
    #signInView?: SignInView;
    // @ts-ignore
    #cartController?: CartController

    //constructor
    constructor() {
        let cashierPromise = Cashier.getAllCashiers();
        cashierPromise.then((allCashiers) => {
            if (allCashiers.length == 0) {
                this.#createCashierView = new CreateCashierView(this);
            } else {
                this.#signInView = new SignInView(this);
            }
        }).catch((e) => {
            console.log("error loading cashiers:", e);
        });

    }

    /**
     * Creates cashier given its username and password
     * @param username the  username of cashier to be created
     * @param password the  password of cashier to be created
     */
    async createCashier(username: string, password: string) {
        let existingCashier = await Cashier.getCashierByUsername(username);

        if (existingCashier !== null) {
            throw new DuplicateUserNameException();
        }

        this.#cashier = new Cashier(username, password);
        await Cashier.saveCashier(this.#cashier);
        let cart = await Cart.getCartByCashier(username);
        if (cart === null) {
            cart = new Cart();
            await Cart.saveCart(cart, username);
        }

        this.#createCashierView = undefined;
        this.#signInView = undefined;
        this.#cartController = new CartController(this.#cashier, cart);

    }

    /**
     * Sign cashier into account based on username and password
     * @param username the username of cashier to be signed in
     * @param password the password of cashier to be signed in
     */
    async signIn(username: string, password: string) {
        let cashier = await Cashier.getCashierByUsername(username);

        if (cashier === null) {
            throw new UserNameUnfoundException();
        }

        if (cashier.getPassword() !== password) {
            throw new IncorrectPasswordException();
        }
        let cart = await Cart.getCartByCashier(username);
        if (cart === null) {
            cart = new Cart();
            await Cart.saveCart(cart, username);
        }

        this.#cashier = cashier;
        this.#signInView = undefined;
        this.#createCashierView = undefined;
        this.#cartController = new CartController(this.#cashier, cart);

    }


}

export class DuplicateUserNameException extends Error {
}

export class UserNameUnfoundException extends Error {
}

export class IncorrectPasswordException extends Error {
}
