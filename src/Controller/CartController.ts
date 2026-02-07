import Cart from "../model/Cart.ts";
import CartView from "../View/CartView.ts";
import Product from "../model/Product.ts";
import ReceiptView from "../View/ReceiptView.ts";

export default class CartController {
    #cart: Cart;
    #cartView: CartView;

    constructor() {
        this.#cart = new Cart();
        this.#cartView = new CartView(this.#cart, this);
    }

    addToCart(product: Product) {
        this.#cart.addProduct(product);

    }

    removeFromCart(product: Product) {
        this.#cart.removeProduct(product);

    }

    checkOut() {
        const receipt = this.#cart.checkOut();   // IMPORTANT: returns Receipt
        new ReceiptView(receipt, this);
    }

    showCartView() {
        this.#cartView = new CartView(this.#cart, this);
    }
}