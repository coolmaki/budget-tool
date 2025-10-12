export class BudgetNotSetError extends Error {
    public constructor() {
        super("A budget has not been set.");
    }
}

export class CategoryNotSetError extends Error {
    public constructor() {
        super("A category has not been set.");
    }
}

export class AccountNotSetError extends Error {
    public constructor() {
        super("A account has not been set.");
    }
}