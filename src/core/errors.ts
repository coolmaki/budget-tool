export class BudgetNotFound extends Error {
    public constructor(public readonly id: string) {
        super();
    }
}

export class BudgetNameAlreadyUsedError extends Error {
    public constructor(public readonly name: string) {
        super();
    }
}

export class IncomeNotFound extends Error {
    public readonly budgetId: string;
    public readonly id: string;

    public constructor({ budgetId, id }: { budgetId: string, id: string }) {
        super();
        this.budgetId = budgetId;
        this.id = id;
    }
}

export class AccountNotFound extends Error {
    public readonly budgetId: string;
    public readonly id: string;

    public constructor({ budgetId, id }: { budgetId: string, id: string }) {
        super();
        this.budgetId = budgetId;
        this.id = id;
    }
}

export class CategoryNotFound extends Error {
    public readonly budgetId: string;
    public readonly id: string;

    public constructor({ budgetId, id }: { budgetId: string, id: string }) {
        super();
        this.budgetId = budgetId;
        this.id = id;
    }
}

export class ExpenseNotFound extends Error {
    public readonly budgetId: string;
    public readonly id: string;

    public constructor({ budgetId, id }: { budgetId: string, id: string }) {
        super();
        this.budgetId = budgetId;
        this.id = id;
    }
}

export class CategoryHasAssociatedExpensesError extends Error {
    public readonly budgetId: string;
    public readonly categoryId: string;

    public constructor({ budgetId, categoryId }: { budgetId: string, categoryId: string }) {
        super();
        this.budgetId = budgetId;
        this.categoryId = categoryId;
    }
}

export class AccountHasAssociatedExpensesError extends Error {
    public readonly budgetId: string;
    public readonly accountId: string;

    public constructor({ budgetId, accountId }: { budgetId: string, accountId: string }) {
        super();
        this.budgetId = budgetId;
        this.accountId = accountId;
    }
}