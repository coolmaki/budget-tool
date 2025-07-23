
export type Budget = {
    id: string;
    name: string;
};

export type Category = {
    budgetId: string;
    id: string;
    name: string;
}

export type Account = {
    budgetId: string;
    id: string;
    name: string;
};

export type Expense = {
    budgetId: string;
    id: string;
    name: string;
    amount: number;
    categoryId: string;
    accountId: string;
};
