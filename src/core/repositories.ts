import type * as Entities from "@/core/entities";
import type * as Models from "@/core/models";
import type { AccountExistsQuery, BudgetExistsQuery, BudgetNameExistsQuery, CategoryExistsQuery, ExpenseExistsQuery, GetAccountsQuery, GetBudgetsQuery, GetCategoriesQuery, GetExpensesQuery } from "@/core/queries";

export type CommandRepository = {
    // Budgets
    createBudget: (budget: Entities.Budget) => void;
    updateBudget: (budget: Entities.Budget) => void;

    // Categories
    createCategory: (category: Entities.Category) => void;
    updateCategory: (category: Entities.Category) => void;

    // Accounts
    createAccount: (account: Entities.Account) => void;
    updateAccount: (account: Entities.Account) => void;

    // Expenses
    createExpense: (expense: Entities.Expense) => void;
    updateExpense: (expense: Entities.Expense) => void;
};

export type QueryRepository = {
    // Budgets
    getBudgets: (query: GetBudgetsQuery) => Models.Budget[];
    budgetExists: (query: BudgetExistsQuery) => boolean;
    budgetNameExists: (query: BudgetNameExistsQuery) => boolean;

    // Categories
    getCategories: (query: GetCategoriesQuery) => Models.Category[];
    categoryExists: (query: CategoryExistsQuery) => boolean;

    // Accounts
    getAccounts: (query: GetAccountsQuery) => Models.Account[];
    accountExists: (query: AccountExistsQuery) => boolean;

    // Expenses
    getExpenses: (query: GetExpensesQuery) => Models.Expense[];
    expenseExists: (query: ExpenseExistsQuery) => boolean;
};

export type AuditRepository = {
    log: (audit: { command: string, data: any }) => void;
};
