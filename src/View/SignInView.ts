import type CashierController from "../Controller/CashierController.ts";
import {
    UserNameUnfoundException,
    IncorrectPasswordException
} from "../Controller/CashierController.ts";

export default class SignInView {
    #controller: CashierController;
    #dialog: HTMLDialogElement;

    constructor(controller: CashierController) {
        this.#controller = controller;

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "sign-in-dialog";
        this.#dialog.innerHTML = `
            <span id="error"></span><br />
            
            <label for="username">Username</label>
            <input type="text" id="username" />
            
            <label for="password">Password</label>
            <input type="password" id="password" />
            
            <button>Sign In</button>
        `;

        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#signIn());

        document.body.appendChild(this.#dialog);
        this.#dialog.show();
    }

    async #signIn() {
        const username = this.#dialog
            .querySelector<HTMLInputElement>("input[type='text']")!.value;

        const password = this.#dialog
            .querySelector<HTMLInputElement>("input[type='password']")!.value;

        try {
            await this.#controller.signIn(username, password);
            document.body.removeChild(this.#dialog);
        } catch (e: any) {
            if (e instanceof UserNameUnfoundException) {
                this.#dialog.querySelector<HTMLInputElement>("input[type='text']")!
                    .setAttribute("style", "border-color:red;");
                this.#dialog.querySelector("#error")!
                    .textContent = "Username not found. Please try again.";
            } else if (e instanceof IncorrectPasswordException) {
                this.#dialog.querySelector<HTMLInputElement>("input[type='password']")!
                    .setAttribute("style", "border-color:red;");
                this.#dialog.querySelector("#error")!
                    .textContent = "Incorrect password. Please try again.";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }
}