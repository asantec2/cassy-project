/**
 * The {@code Listener} interface represents an observer that is notified
 * when the state of an object changes.
 */


export default interface Listener {
    notify(): void;
}