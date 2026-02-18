/**
 * Checks that a condition is true and throws an AssertionError if it is false.
 * @param val the condition being checked
 * @param message the error message if the assertion fails
 */
export function assert(val: any, message: string): asserts val {
    if (!val) {
        throw new AssertionError(message);
    }

}

/**
 * Represents an error thrown when an assertion fails.
 */
class AssertionError extends Error {
    constructor(message: string) {
        super(message);
    }
}