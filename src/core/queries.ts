// Budgets
export type GetBudgetsQuery = {};
export type BudgetExistsQuery = { id: string };
export type BudgetNameExistsQuery = { name: string };

// Categories
export type GetCategoriesQuery = { budgetId: string };
export type CategoryExistsQuery = { budgetId: string; id: string };

// Accounts
export type GetAccountsQuery = { budgetId: string };
export type AccountExistsQuery = { budgetId: string; id: string };

// Expenses
export type GetExpensesQuery = { budgetId: string, name?: string, categoryId?: string, accountId?: string };
export type ExpenseExistsQuery = { budgetId: string; id: string };
