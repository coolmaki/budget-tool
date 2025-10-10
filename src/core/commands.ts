import type { PeriodType } from "@/core/types";

// Budgets
export type CreateBudgetCommand = { name: string };
export type UpdateBudgetCommand = { id: string, name: string };

// Incomes
export type CreateIncomeCommand = { budgetId: string; name: string; periodType: PeriodType, periodAmount: number, amount: number };
export type UpdateIncomeCommand = { budgetId: string; id: string; name: string; periodType: PeriodType, periodAmount: number, amount: number };

// Accounts
export type CreateAccountCommand = { budgetId: string, name: string };
export type UpdateAccountCommand = { budgetId: string, id: string, name: string };

// Categories
export type CreateCategoryCommand = { budgetId: string, name: string };
export type UpdateCategoryCommand = { budgetId: string, id: string, name: string };

// Expenses
export type CreateExpense = { budgetId: string, name: string, periodType: PeriodType, periodAmount: number };
export type UpdateExpense = { budgetId: string, id: string, name: string, periodType: PeriodType, periodAmount: number };
