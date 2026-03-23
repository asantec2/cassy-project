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
     * Converts an ArrayBuffer into a hexadecimal string.
     * @param buffer the ArrayBuffer to convert
     * @returns the hexadecimal string
     */
    static bytesToHex(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let hex = "";

        for (let i = 0; i < bytes.length; i++) {
            hex = hex + bytes[i].toString(16).padStart(2, "0");
        }

        return hex;
    }
    /**
     * Hashes a password using PBKDF2 and the username as the salt.
     * @param password the plain text password
     * @param username the username used as salt
     * @returns the hashed password as a hexadecimal string
     */
    static async hashPassword(password: string, username: string): Promise<string> {
        const encoder = new TextEncoder();
        const passwordBytes = encoder.encode(password);
        const saltBytes = encoder.encode(username);

        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            passwordBytes,
            { name: "PBKDF2" },
            false,
            ["deriveBits"]
        );

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: saltBytes,
                iterations: 10000,
                hash: "SHA-256"
            },
            keyMaterial,
            256
        );

        return CashierController.bytesToHex(derivedBits);
    }


    /**
     * Creates cashier given its username and password
     * @param username the  username of cashier to be created
     * @param password the  password of cashier to be created
     */
    async createCashier(username: string, password: string) {
        const existingCashier = await Cashier.getCashierByUsername(username);

        if (existingCashier !== null) {
            throw new DuplicateUserNameException();
        }

        const hashedPassword = await CashierController.hashPassword(password, username);

        this.#cashier = new Cashier(username, hashedPassword);
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
        const cashier = await Cashier.getCashierByUsername(username);

        if (cashier === null) {
            throw new UserNameUnfoundException();
        }

        const hashedPassword = await CashierController.hashPassword(password, username);

        if (cashier.getPassword() !== hashedPassword) {
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
