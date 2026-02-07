import Cart from "../model/Cart.ts";
import CartController from "../Controller/CartController.ts";
import Smoothie from "../model/Smoothie.ts";
import Juice from "../model/Juice.ts";
export default class CartView{
    #cart :Cart;
    #teamEl : HTMLUListElement;
    #cartController : CartController;

    constructor(cart :Cart, cartController :CartController) {
        this.#cart = cart;
        this.#cartController = cartController;
        this.#cart.registerListener(this);


        document.querySelector("#app")!.innerHTML = `
        <div id="cart"
            <h2>Available Drinks</h2>

            <div id="drink-images" style="display: flex; gap: 40px;">

                <div class="drink">
                    <img src="/images/smothie.png" alt="Smoothie" width="300">
                    <p>Smoothie</p>
                    
                    <strong>Strawberry Sunshine</strong>
                    <p></p>
                    <button id="add-smoothie">Add Smoothie</button>
                    <button id="remove-smoothie">Remove Smoothie</button>
                </div>

                <div class="drink">
                    <img src="/images/juice.png" alt="Juice" width="300">
                    <p>Juice</p>
                    
                    <strong/> Orange Juice </strong>
                    <p></p>
                    <button id="add-juice">Add Juice</button>
                    <button id="remove-juice">Remove Juice</button>
                </div>

            </div>

            <h3>Cart</h3>
            <ul></ul>

            <button id="check-out">Check out</button>
        </div>
        `
        this.#teamEl = document.querySelector("#cart > ul")!;

        document.querySelector("#add-smoothie")!.addEventListener("click",() => this.#cartController.addToCart(new Smoothie("Strawberry Sunshine",10)));
        document.querySelector("#remove-smoothie")!.addEventListener("click",()=> this.#cartController.removeFromCart(new Smoothie("Strawberry Sunshine",10)));
        document.querySelector("#add-juice")!.addEventListener("click",() => this.#cartController.addToCart(new Juice("Orange Juice",15)));
        document.querySelector("#remove-juice")!.addEventListener("click",()=> this.#cartController.removeFromCart(new Juice("Orange Juice",15)));
        document.querySelector("#check-out")!.addEventListener("click",() => this.#cartController.checkOut());

    }
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

}