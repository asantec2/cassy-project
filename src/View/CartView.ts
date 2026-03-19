/**
 * The {@code CartView} class represents the user interface for the shopping cart.
 * It displays available products and cart contents, forwards user actions to
 * {@link CartController}, and updates when notified by the {@link Cart} model.
 */

import Cart, {InvalidCouponAdditionException, InvalidCouponRemovalException} from "../model/Cart.ts";
import CartController from "../Controller/CartController.ts";


import {InvalidCartCheckoutException} from "../model/Cart.ts";
import {InvalidProductAdditionException} from "../model/Cart.ts";
import {InvalidProductRemovalException} from "../model/Cart.ts";
export default class CartView{
    #cart :Cart;
    #teamEl : HTMLUListElement;
    #cartController : CartController;
    #errorEl: HTMLSpanElement;
    #addFroyoDialog: HTMLDialogElement;
    #removeFroyoDialog: HTMLDialogElement;

    //constructor
    constructor(cart :Cart, cartController :CartController) {
        this.#cart = cart;
        this.#cartController = cartController;
        this.#cart.registerListener(this);


        document.querySelector("#app")!.innerHTML = `
        <div id="cart">
           
            <h2>Available Drinks</h2>

            <div id="drink-images" style="display: flex; gap: 40px;">

                <div class="drink">
                    <img src="/images/smothie.png" alt="Smoothie" width="400">
                    <p>Smoothie</p>
                    
                    <strong>Strawberry Sunshine</strong>
                    <p></p>
                    <button id="add-smoothie">Add Smoothie</button>
                    <button id="remove-smoothie">Remove Smoothie</button>
                </div>

                <div class="drink">
                    <img src="/images/juice.png" alt="Juice" width="400">
                    <p>Juice</p>
                    
                    <strong/> Orange Juice </strong>
                    <p></p>
                    <button id="add-juice">Add Juice</button>
                    <button id="remove-juice">Remove Juice</button>
                </div>


                <div class="drink">
                    <img src="/images/froyo.png" alt="Juice" width="400">
                    <p>Frozen Yogurt</p>
                    
                    <strong/>Vanilla Froyo</strong>
                    <p></p>
                    <button id="show-add-froyo">Add Froyo</button>
                    <button id="show-remove-froyo">Remove Froyo</button>   
                </div>
            </div>

            <h3>Cart</h3>
            <ul></ul>
            
        <span id="error"></span><br />
        <div class="coupon-section">
      <h3>Coupons</h3>

       <div class="coupon">
        <strong>BOGO</strong>
        <p>Buy one drink, get one free.</p>
        <button id="add-bogo">Add BOGO</button>
        <button id="remove-bogo">Remove BOGO</button>
       </div>

      <div class="coupon">
        <strong>25% OFF</strong>
        <p>Get 25% off your total purchase.</p>
        <button id="add-percent">Add 25% OFF</button>
        <button id="remove-percent">Remove 25% OFF</button>
      </div>
     </div>
        <p></p>
            <button id="check-out">Check out</button>
        </div>
        `

        this.#addFroyoDialog = document.createElement("dialog");
        this.#addFroyoDialog.id = "add-froyo-dialog";
        this.#addFroyoDialog.innerHTML = `
                    <span id="add-froyo-error"></span><br />
                    <label for="add-froyo-amount">Froyo amount</label>
                    <input type="number" id="add-froyo-amount" />
                    <button id="add-froyo">Add Froyo</button>`;

        this.#addFroyoDialog.querySelector("button")!
            .addEventListener("click", () => this.#addFroyo());
        document.body.appendChild(this.#addFroyoDialog);


        this.#removeFroyoDialog = document.createElement("dialog");
        this.#removeFroyoDialog.id = "remove-froyo-dialog";
        this.#removeFroyoDialog.innerHTML = `
            <span id="remove-froyo-error"></span><br />
            <label for="remove-froyo-amount">Froyo amount</label>
            <input type="number" id="remove-froyo-amount" />
            <button id="remove-froyo">Remove Froyo</button>
        `;
        this.#removeFroyoDialog.querySelector("button")!
            .addEventListener("click", () => this.#removeFroyo());
        document.body.appendChild(this.#removeFroyoDialog);


        this.#teamEl = document.querySelector("#cart > ul")!;
        this.#errorEl = document.querySelector("#error")! as HTMLSpanElement;


        document.querySelector("#add-smoothie")!.addEventListener("click",() => this.#addSmoothie());
        document.querySelector("#remove-smoothie")!.addEventListener("click",()=> this.#removeSmoothie());
        document.querySelector("#add-juice")!.addEventListener("click",() => this.#addJuice());
        document.querySelector("#remove-juice")!.addEventListener("click",()=> this.#removeJuice());
        document.querySelector("#check-out")!.addEventListener("click",() => this.#checkOut());
        document.querySelector("#show-add-froyo")!.addEventListener("click", () => this.#addFroyoDialog.show());
        document.querySelector("#show-remove-froyo")!.addEventListener("click", () => this.#removeFroyoDialog.show());
        document.querySelector("#add-bogo")!.addEventListener("click", () => this.#addBOGO());
        document.querySelector("#remove-bogo")!.addEventListener("click", () => this.#removeBOGO());
        document.querySelector("#add-percent")!.addEventListener("click", () => this.#addPercent25());
        document.querySelector("#remove-percent")!.addEventListener("click", () => this.#removePercent25());
    }
    /**
     * Updates the cart display when the model changes.
     * Re-renders all cart items and the total price.
     */
        notify(){
        this.#teamEl.replaceChildren();
        this.#cart.getItems().forEach((p)=>{
            let cartEl = document.createElement("li");
            cartEl.innerHTML = `
            <table class="cart-table">
                <tr>
                    <td class="item-name">${p.getName()}</td>
                    <td class="item-price">$${p.getPrice()}.00</td>
                </tr>
            </table>
        `;
            this.#teamEl.appendChild(cartEl);
        });
        const totalEl = document.createElement("li");
        totalEl.innerHTML = `
        <table class="cart-table">
            <tr>
                <td class="item-name"><strong>Total</strong></td>
                <td class="item-price"><strong>$${this.#cart.getTotal()}.00</strong></td>
            </tr>
        </table>
    `;
        this.#teamEl.appendChild(totalEl);

    }

    /**
     * Requests the controller to add a Smoothie to the cart.
     * Displays an error message if the product is unavailable.
     */
    #addSmoothie() {

        try {
            this.#cartController.addSmoothie();
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidProductAdditionException) {
                this.#errorEl.textContent = "Strawberry Sunshine is unavailable at this time. Try again next time.";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }
    #addFroyo(){
        const amount = this.#addFroyoDialog
            .querySelector<HTMLInputElement>("input[type='number']")!.valueAsNumber;

        try {
            this.#cartController.addFroyo(amount);
            this.#addFroyoDialog.querySelector("#add-froyo-error")!.textContent = "";
            this.#addFroyoDialog.querySelector("input[type='number']")!
                .setAttribute("style", "border-color:;");
            this.#errorEl.textContent = "";
            this.#addFroyoDialog.close();
        } catch (e: any) {
            if (e instanceof InvalidProductAdditionException) {
                this.#addFroyoDialog.querySelector("input[type='number']")!
                    .setAttribute("style", "border-color:red;");
                this.#addFroyoDialog.querySelector("#add-froyo-error")!
                    .textContent = "Invalid Froyo amount or Vanilla Froyo is unavailable.";
                this.#errorEl.textContent = "Vanilla froyo is unavailable at this time. Try again next time.";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }
    #removeFroyo(){
        const amount = this.#removeFroyoDialog
            .querySelector<HTMLInputElement>("input[type='number']")!.valueAsNumber;

        try {
            this.#cartController.removeFroyo(amount);
            this.#removeFroyoDialog.querySelector("#remove-froyo-error")!.textContent = "";
            this.#removeFroyoDialog.querySelector("input[type='number']")!
                .setAttribute("style", "border-color:;");
            this.#errorEl.textContent = "";
            this.#removeFroyoDialog.close();
        } catch (e: any) {
            if (e instanceof InvalidProductRemovalException) {
                this.#removeFroyoDialog.querySelector("input[type='number']")!
                    .setAttribute("style", "border-color:red;");
                this.#removeFroyoDialog.querySelector("#remove-froyo-error")!
                    .textContent = "Invalid Froyo amount or not enough Froyo in cart.";
                this.#errorEl.textContent = "Vanilla froyo has not been added to cart!";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Requests the controller to remove a Smoothie from the cart.
     * Displays an error message if the product is not in the cart.
     */
    #removeSmoothie() {

        try {
            this.#cartController.removeSmoothie();
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidProductRemovalException) {
                this.#errorEl.textContent = "Strawberry Sunshine has not been added to cart!";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Requests the controller to add a Juice to the cart.
     * Displays an error message if the product is unavailable.
     */
    #addJuice() {
        try {
            this.#cartController.addJuice();
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidProductAdditionException) {
                this.#errorEl.textContent = "Orange Juice is unavailable at this time.Try again next time.";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Requests the controller to remove a Juice from the cart.
     * Displays an error message if the product is not in the cart.
     */
    #removeJuice() {

        try {
            this.#cartController.removeJuice();
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidProductRemovalException) {
                this.#errorEl.textContent = "Orange Juice has not been added to cart yet!";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Requests the controller to complete checkout.
     * Displays an error message if the cart is empty.
     */
    #checkOut() {

        try {
            this.#cartController.checkOut()
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidCartCheckoutException) {
                this.#errorEl.textContent = "Cart is empty. Add items before checking out.";

            } else {
                console.log("unexpected error " + e);
            }
        }
    }
    #addBOGO() {
        try {
            this.#cartController.addBOGO();
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidCouponAdditionException) {
                this.#errorEl.textContent = "BOGO has already been added to the cart!";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    #removeBOGO() {
        try {
            this.#cartController.removeBOGO();
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidCouponRemovalException) {
                this.#errorEl.textContent = "BOGO has not been added to the cart!";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    #addPercent25() {
        try {
            this.#cartController.addPercent25();
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidCouponAdditionException) {
                this.#errorEl.textContent = "25% OFF coupon has already been added to the cart!";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    #removePercent25() {
        try {
            this.#cartController.removePercent25();
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidCouponRemovalException) {
                this.#errorEl.textContent = "25% OFF coupon has not been added to the cart!";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }


}