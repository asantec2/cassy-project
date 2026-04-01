import Receipt from "./Receipt.ts";
import {assert} from "../assertions.ts";
import db from './connection.ts'



export default class Cashier {
    #username: string;
    #password: string;
    #receipts: Array<Receipt>;



    //constructor
    constructor(username: string, password: string) {
        if (username.length === 0 || username.length >= 15) {
            throw new InvalidUsernameException();
        }
        if (/^[0-9]+$/.test(username)) {
            throw new InvalidNumericUsernameException();
        }
        if (password.length === 0) {
            throw new InvalidPasswordException();
        }
        this.#username = username;
        this.#password = password;
        this.#receipts = new Array<Receipt>();
        this.#checkCashier();
    }

    //implementation of class invariants
    #checkCashier() {
        assert(this.#username.length >= 1, "username must contain at least one character");
        assert(this.#password.length >= 1, "password must contain at least one character");
    }

    /**
     * Save cashier by inserting it into database
     * @param cashier cashier to be saved into database
     */
    static async saveCashier(cashier: Cashier): Promise<Cashier> {
        await db().query<{
            username: string,
            password: string
        }>("insert into cashier(username,password) values($1,$2) on conflict do nothing returning username",
            [cashier.getUserName(), cashier.getPassword()]);
        return cashier

    }
    async #verifyPassword(password: string): Promise<boolean> {
        const hashedPassword = await Cashier.#hashPassword(password, this.#username);
        return this.#password === hashedPassword;
    }

    /**
     * Gets all cashiers from database
     */
    static async getAllCashiers(): Promise<Array<Cashier>> {
        const allCashiers = new Array<Cashier>();
        let results = await db()
            .query<{ username: string, password: string }>("select username,password from cashier");
        for (let row of results.rows) {
            let cashier = new Cashier(row.username, row.password)
            allCashiers.push(cashier);
        }
        return allCashiers;
    }

    /**
     * Gets cashier from database based on username
     * @param username the username we want to get cashier based on
     */
    static async getCashierByUsername(username: string): Promise<Cashier | null> {
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
        if (row === undefined) {
            return null;
        }
        return new Cashier(row.username, row.password);
    }

    getReceipts() {
        return this.#receipts;
    }

    getPassword() {
        return this.#password;
    }

    getUserName() {
        return this.#username
    }

    /**
     * Add receipts to cashiers list of receipts
     * @param receipt to be added
     */
    addReceipt(receipt: Receipt) {
        this.#receipts.push(receipt);
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
    static async #hashPassword(password: string, username: string): Promise<string> {
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

        return Cashier.bytesToHex(derivedBits);
    }
    static async verifySignIn(username: string, password: string): Promise<Cashier> {
        const cashier = await Cashier.getCashierByUsername(username);

        if (cashier === null) {
            throw new UserNameUnfoundException();
        }

        const isCorrect = await cashier.#verifyPassword(password);

        if (!isCorrect) {
            throw new IncorrectPasswordException();
        }

        return cashier;
    }
    /**
     * Sign cashier into account based on username and password
     * @param username the username of cashier to be signed in
     * @param password the password of cashier to be signed in
     */
    async signIn(username: string, password: string) :Promise<Cashier> {
        const cashier = await Cashier.getCashierByUsername(username);

        if (cashier === null) {
            throw new UserNameUnfoundException();
        }

        const hashedPassword = await Cashier.#hashPassword(password, username);

        if (cashier.getPassword() !== hashedPassword) {
            throw new IncorrectPasswordException();
        }

        return  cashier;
    }
    static async createNewCashier(username: string, password: string): Promise<Cashier> {
        const existingCashier = await Cashier.getCashierByUsername(username);

        if (existingCashier !== null) {
            throw new DuplicateUserNameException();
        }

        const hashedPassword = await Cashier.#hashPassword(password, username);
        const cashier = new Cashier(username, hashedPassword);

        await Cashier.saveCashier(cashier);
        return cashier;
    }
}

export class InvalidUsernameException extends Error {
}

export class InvalidPasswordException extends Error {
}

export class InvalidNumericUsernameException extends Error {
}
export class DuplicateUserNameException extends Error {
}

export class UserNameUnfoundException extends Error {
}

export class IncorrectPasswordException extends Error {
}
