/**
 * The {@code CreateCashierView} class represents the user interface for creating a new {@link Cashier}.
 * It allows the user to input a username and password, validates the input, handles creation errors,
 * and returns to the {@link SignInView} upon successful account creation.
 */

import CashierController from "../Controller/CashierController.ts";
import {DuplicateUserNameException} from "../model/Cashier.ts";
import {InvalidNumericUsernameException, InvalidPasswordException} from "../model/Cashier.ts";
import {InvalidUsernameException} from "../model/Cashier.ts";

export default class CreateCashierView {
    #controller: CashierController;
    #dialog: HTMLDialogElement;

    //constructor
    constructor(controller: CashierController) {

        this.#controller = controller;

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "add-cashier-dialog";
        this.#dialog.innerHTML = `
            <h2 class="welcome-title">Welcome to Booster Juice 🍓🥤</h2>
            <p class="welcome-subtext">Create your account to start ordering!</p>
            <span id="error"></span><br />
            
            <label for="username">Username</label>
           <input type="text" id="username" class="input-field" />
        
        <label for="password">Password</label>
        <input type="password" id="password" class="input-field" />
        
        <button class="sign-in-btn">Create Account</button>
        `;

        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#addCashier());

        document.body.appendChild(this.#dialog);
        this.#dialog.showModal();
    }

    /**
     * Adds cashier by calling create cashier after receiving username and password
     * Validates components given to make sure its unique*/
    async #addCashier() {
        const username = this.#dialog
            .querySelector<HTMLInputElement>("input[type='text']")!.value;

        const password = this.#dialog
            .querySelector<HTMLInputElement>("input[type='password']")!.value;

        try {
            await this.#controller.createCashier(username, password);
            document.body.removeChild(this.#dialog);

        } catch (e: any) {

            if (e instanceof DuplicateUserNameException) {
                this.#dialog.querySelector("#error")!.textContent =
                    "Username already exists. Please try again";

            } else if (e instanceof InvalidUsernameException) {
                this.#dialog.querySelector("input[type='text']")!
                    .setAttribute("style", "border-color:red;");
                this.#dialog.querySelector("#error")!.textContent =
                    "Invalid username.Please try again";

            } else if (e instanceof InvalidPasswordException) {
                this.#dialog.querySelector("input[type='password']")!
                    .setAttribute("style", "border-color:red;");
                this.#dialog.querySelector("#error")!.textContent =
                    "Invalid password.Please try again";

            }else if(e instanceof  InvalidNumericUsernameException){
                this.#dialog.querySelector("input[type='text']")!
                    .setAttribute("style", "border-color:red;");
                this.#dialog.querySelector("#error")!.textContent =
                    "Invalid numeric username.Please try again";
            } else {
                console.error(e);
            }
        }
    }

}