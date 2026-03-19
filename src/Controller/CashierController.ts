import Cashier from "../model/Cashier.ts";
import CreateCashierView from "../View/CreateCashierView.ts";
import SignInView from "../View/SignInView.ts";
import  CartController from "./CartController.ts";

export default class CashierController{
    #cashier? :Cashier;
    #createCashierView? : CreateCashierView;
    #signInView? : SignInView;
    #cartController? : CartController

    constructor() {
        let cashierPromise = Cashier.getAllCashiers();
        cashierPromise.then((allCashiers)=>{
            if(allCashiers.length == 0){
                this.#createCashierView = new CreateCashierView(this);
            }else{
                this.#signInView = new SignInView(this);
            }
        })



    }
    async createCashier(username: string, password: string) {
        let existingCashier = await Cashier.getCashierByUsername(username);

        if (existingCashier !== null) {
            throw new DuplicateUserNameException();
        }

        this.#cashier = new Cashier(username, password);
        await Cashier.saveCashier(this.#cashier);

        this.#createCashierView = undefined;
        this.#signInView = undefined;
        this.#cartController  = new CartController(this.#cashier);

    }

    async signIn(username: string, password: string) {
        let cashier = await Cashier.getCashierByUsername(username);

        if (cashier === null) {
            throw new UserNameUnfoundException();
        }

        if (cashier.getPassword() !== password) {
            throw new IncorrectPasswordException();
        }

        this.#cashier = cashier;
        this.#signInView = undefined;
        this.#createCashierView = undefined;
        this.#cartController = new CartController(this.#cashier);

    }

    showCreateCashierView() {
        if (this.#createCashierView === undefined) {
            this.#createCashierView = new CreateCashierView(this);
        }
    }

    showSignInView() {
        if (this.#signInView === undefined) {
            this.#signInView = new SignInView(this);
        }
    }

    getCashier(): Cashier | undefined {
        return this.#cashier;
    }
    getCartController(): CartController | undefined {
        return this.#cartController;
    }


}
export class DuplicateUserNameException extends Error{}
export class UserNameUnfoundException extends Error{}
export class IncorrectPasswordException extends Error{}
