export type DatabaseOperation<T> = {
    run: () => T;
};