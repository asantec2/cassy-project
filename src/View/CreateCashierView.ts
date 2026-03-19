import CashierController, {DuplicateUserNameException} from "../Controller/CashierController.ts";
import {InvalidPasswordException} from "../model/Cashier.ts";
import {InvalidUsernameException} from "../model/Cashier.ts";

export default class CreateCashierView {
    #controller: CashierController;
    #dialog: HTMLDialogElement;

    constructor(controller: CashierController) {
        this.#controller = controller;

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "add-cashier-dialog";
        this.#dialog.innerHTML = `
            <span id="error"></span><br />
            
            <label for="username">Username</label>
            <input type="text" id="username" />
            
            <label for="password">Password</label>
            <input type="password" id="password" />
            
            <button>Add Cashier</button>
        `;

        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#addCashier());

        document.body.appendChild(this.#dialog);
        this.#dialog.show();
    }

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

            } else {
                console.log("unexpected error " + e);
            }
        }
    }

}