import type { Period } from "@/core/types";

export type Expense = {
    budgetId: string;
    id: string;
    name: string;
    period: Period;
    amount: number;
    categoryId: string;
    accountId: string;
};
