/**
 * The {@code SignInView} class represents the user interface for signing in an existing {@link Cashier}.
 * It allows the user to enter their username and password, handles authentication errors,
 * and provides navigation to the {@link CreateCashierView} for account creation.
 */

import type CashierController from "../Controller/CashierController.ts";
import {
    UserNameUnfoundException,
    IncorrectPasswordException
} from "../model/Cashier.ts";
import CreateCashierView from "./CreateCashierView.ts";

export default class SignInView {
    #controller: CashierController;
    #dialog: HTMLDialogElement;

    //constructor
    constructor(controller: CashierController) {
        this.#controller = controller;

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "sign-in-dialog";
        this.#dialog.innerHTML = `
            <h2 class="welcome-title">Welcome to Booster Juice </h2>
            <p class="welcome-subtext">Sign in or Create your account to start ordering!</p>
            <span id="error"></span><br />
            
            <label for="username">Username</label>
            <input type="text" id="username" />
            
            <label for="password">Password</label>
            <input type="password" id="password" />
            
            <button>Sign In</button>
            <button id="create-account-button" type="button">Create Account</button>
        `;

        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#signIn());

        this.#dialog.querySelector("#create-account-button")!
            .addEventListener("click", () => this.#goToCreateAccount());
        document.body.appendChild(this.#dialog);
        this.#dialog.show();

    }

    /**
     * Sign cashier into account where ordering can begin
     * Validates username and password provided to ensure account exists
     * */
    async #signIn() {
        const username = this.#dialog.querySelector<HTMLInputElement>("input[type='text']")!.value;
        const password = this.#dialog.querySelector<HTMLInputElement>("input[type='password']")!.value;
        try {
            await this.#controller.signIn(username, password);
            document.body.removeChild(this.#dialog);
        } catch (e: any) {
            if (e instanceof UserNameUnfoundException) {
                this.#dialog.querySelector<HTMLInputElement>("input[type='text']")!.setAttribute("style", "border-color:red;");
                this.#dialog.querySelector("#error")!.textContent = "Username not found. Please enter a valid username.";
            } else if (e instanceof IncorrectPasswordException) {
                this.#dialog.querySelector<HTMLInputElement>("input[type='password']")!.setAttribute("style", "border-color:red;");
                this.#dialog.querySelector("#error")!.textContent = "Incorrect password. Please enter correct password.";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Create cashier view when a new cashier account needs to be created
     * */
    #goToCreateAccount() {
        document.body.removeChild(this.#dialog);
        new CreateCashierView(this.#controller);
    }
}