// Budgets
export type GetBudgetsQuery = { search: string };
export type BudgetExistsQuery = { id: string };
export type BudgetNameExistsQuery = { name: string };

// Incomes
export type GetIncomeQuery = { budgetId: string; id: string };
export type GetIncomesQuery = { budgetId: string; search: string };
export type IncomeExistsQuery = { budgetId: string; id: string };
export type TotalIncomeQuery = { budgetId: string };

// Accounts
export type GetAccountQuery = { budgetId: string; id: string };
export type GetAccountsQuery = { budgetId: string; search: string };
export type AccountExistsQuery = { budgetId: string; id: string };

// Categories
export type GetCategoryQuery = { budgetId: string; id: string };
export type GetCategoriesQuery = { budgetId: string; search: string };
export type CategoryExistsQuery = { budgetId: string; id: string };

// Expenses
export type GetExpenseQuery = { budgetId: string; id: string };
export type GetExpensesQuery = { budgetId: string; search?: string; categoryId?: string; accountId?: string };
export type ExpenseExistsQuery = { budgetId: string; id: string };
