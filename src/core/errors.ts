export class BudgetNameAlreadyUsedError extends Error {
    public constructor(public readonly name: string) {
        super();
    }
}