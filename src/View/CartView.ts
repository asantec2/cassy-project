/**
 * The {@code CartView} class represents the user interface for the shopping cart.
 * It displays available products and cart contents, forwards user actions to
 * {@link CartController}, and updates when notified by the {@link Cart} model.
 */

import Cart from "../model/Cart.ts";
import CartController from "../Controller/CartController.ts";

import {InvalidCartCheckoutException} from "../model/Cart.ts";
import {InvalidProductAdditionException} from "../model/Cart.ts";
import {InvalidProductRemovalException} from "../model/Cart.ts";
export default class CartView{
    #cart :Cart;
    #teamEl : HTMLUListElement;
    #cartController : CartController;
    #errorEl: HTMLSpanElement

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

            </div>

            <h3>Cart</h3>
            <ul></ul>
            
        <span id="error"></span><br />
        <p></p>
            <button id="check-out">Check out</button>
        </div>
        `


        this.#teamEl = document.querySelector("#cart > ul")!;
        this.#errorEl = document.querySelector("#error")! as HTMLSpanElement;


        document.querySelector("#add-smoothie")!.addEventListener("click",() => this.#addSmoothie());
        document.querySelector("#remove-smoothie")!.addEventListener("click",()=> this.#removeSmoothie());
        document.querySelector("#add-juice")!.addEventListener("click",() => this.#addJuice());
        document.querySelector("#remove-juice")!.addEventListener("click",()=> this.#removeJuice());
        document.querySelector("#check-out")!.addEventListener("click",() => this.#checkOut());

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


}