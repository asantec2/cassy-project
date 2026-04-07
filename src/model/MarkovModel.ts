/**
 * The {@code MarkovModel} type represents a trained Markov chain used
 * to predict the next product based on previous purchases.
 *
 */
import seedrandom from "seedrandom";
/**
 * Structure of the trained model loaded from model.json.
 */
export type MarkovModel = {
    numerators: number[][];
    denominators: number[];
    products: string[];
    labelIndexMap: Record<string, number>;
};

let model: MarkovModel;
const rng = seedrandom("auto-shopper-seed");

/**
 * Loads the Markov model from model.json.
 * @returns the loaded Markov model
 */
export default async function markovModel(): Promise<MarkovModel> {
    if(!model){
        const response = await fetch("/model.json");
        if (!response.ok) {
            throw new UntrainedMarkovModeException();
        }
        model = await response.json();
    }
    return model;
}
/**
 * Determines the next product based on the current product
 * using weighted random selection.
 * @param productName the current product
 * @returns the next product name
 */
export async function  getNextState( productName: string) :Promise<string> {
     let model = await markovModel();
    const currentIndex =  model.products.indexOf(productName);

    if(currentIndex === -1){
        throw new InvalidPreviousProductException();
    }
    const denominator = model.denominators[currentIndex];
    if(denominator === 0){
        throw new NoOutgoingTransitionException();
    }

    console.log(productName);
    const randomNumber =  Math.floor(rng() * denominator) + 1;
    console.log(randomNumber);

    let sum = 0;
    let nextProduct;

    for (let i = 0; i < model.numerators[currentIndex].length; i++) {
        sum += model.numerators[currentIndex][i];

        if (sum >= randomNumber && nextProduct === undefined) {
            nextProduct = model.products[i];
        }
    }
    console.log(nextProduct);


    // @ts-ignore
    return nextProduct;
}
export class UntrainedMarkovModeException extends Error{}
export class InvalidPreviousProductException extends Error{}
export class NoOutgoingTransitionException extends Error{}