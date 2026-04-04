import seedrandom from "seedrandom";
export type MarkovModel = {
    numerators: number[][];
    denominators: number[];
    products: string[];
    labelIndexMap: Record<string, number>;
};

let model: MarkovModel;
const rng = seedrandom("auto-shopper-seed");

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

    const randomNumber =  Math.floor(rng() * denominator) + 1;

    let sum = 0;
    let nextProduct;

    for (let i = 0; i < model.numerators[currentIndex].length; i++) {
        sum += model.numerators[currentIndex][i];

        if (sum >= randomNumber && nextProduct === undefined) {
            nextProduct = model.products[i];
        }
    }


    // @ts-ignore
    return nextProduct;
}
export class UntrainedMarkovModeException extends Error{}
export class InvalidPreviousProductException extends Error{}
export class NoOutgoingTransitionException extends Error{}