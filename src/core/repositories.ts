import type { Account } from "@/core/entities/account";
import type { Budget } from "@/core/entities/budget";
import type { Category } from "@/core/entities/category";
import type { Expense } from "@/core/entities/expense";
import type { Income } from "@/core/entities/income";
import type * as Models from "@/core/models";
import type { AccountExistsQuery, BudgetExistsQuery, BudgetNameExistsQuery, CategoryExistsQuery, ExpenseExistsQuery, GetAccountQuery, GetAccountsQuery, GetBudgetsQuery, GetCategoriesQuery, GetCategoryQuery, GetExpenseQuery, GetExpensesQuery, GetIncomeQuery, GetIncomesQuery, IncomeExistsQuery, TotalIncomeQuery } from "@/core/queries";

export type CommandRepository = {
    // Budgets
    createBudget: (budget: Budget) => void;
    updateBudget: (budget: Budget) => void;
    deleteBudget: (budget: Budget) => void;

    // Incomes
    createIncome: (income: Income) => void;
    updateIncome: (income: Income) => void;
    deleteIncome: (income: Income) => void;

    // Accounts
    createAccount: (account: Account) => void;
    updateAccount: (account: Account) => void;
    deleteAccount: (account: Account) => void;

    // Categories
    createCategory: (category: Category) => void;
    updateCategory: (category: Category) => void;
    deleteCategory: (category: Category) => void;

    // Expenses
    createExpense: (expense: Expense) => void;
    updateExpense: (expense: Expense) => void;
    deleteExpense: (expense: Expense) => void;
};

export type QueryRepository = {
    // Budgets
    getBudgets: (query: GetBudgetsQuery) => Models.Budget[];
    budgetExists: (query: BudgetExistsQuery) => boolean;
    budgetNameExists: (query: BudgetNameExistsQuery) => boolean;

    // Incomes
    getIncome: (query: GetIncomeQuery) => Income | null;
    getIncomes: (query: GetIncomesQuery) => Income[];
    incomeExists: (query: IncomeExistsQuery) => boolean;
    totalIncome: (query: TotalIncomeQuery) => number;

    // Accounts
    getAccount: (query: GetAccountQuery) => Account | null;
    getAccounts: (query: GetAccountsQuery) => Models.Account[];
    accountExists: (query: AccountExistsQuery) => boolean;

    // Categories
    getCategory: (query: GetCategoryQuery) => Category | null;
    getCategories: (query: GetCategoriesQuery) => Models.Category[];
    categoryExists: (query: CategoryExistsQuery) => boolean;

    // Expenses
    getExpense: (query: GetExpenseQuery) => Expense | null;
    getExpenses: (query: GetExpensesQuery) => Models.Expense[];
    expenseExists: (query: ExpenseExistsQuery) => boolean;
};

export type AuditRepository = {
    log: (audit: { command: string, data: any }) => void;
};
