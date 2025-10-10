import { createAccount, type CreateAccountCommand, deleteAccount, type DeleteAccountCommand, getAccounts, type GetAccountsQuery, updateAccount, type UpdateAccountCommand } from "@/core/handlers/account";
import { createBudget, type CreateBudgetCommand, deleteBudget, type DeleteBudgetCommand, getBudgets, type GetBudgetsQuery, updateBudget, type UpdateBudgetCommand } from "@/core/handlers/budget";
import { createCategory, type CreateCategoryCommand, deleteCategory, type DeleteCategoryCommand, getCategories, type GetCategoriesQuery, updateCategory, type UpdateCategoryCommand } from "@/core/handlers/category";
import { createExpense, type CreateExpenseCommand, deleteExpense, type DeleteExpenseCommand, getExpenses, type GetExpensesQuery, updateExpense, type UpdateExpenseCommand } from "@/core/handlers/expense";
import { createIncome, type CreateIncomeCommand, deleteIncome, type DeleteIncomeCommand, getIncomes, type GetIncomesQuery, GetTotalIncome, type GetTotalIncomeQuery, updateIncome, type UpdateIncomeCommand } from "@/core/handlers/income";
import type { Account, Budget, Category, Expense, Income } from "@/core/models";
import type { CommandRepository, QueryRepository } from "@/core/repositories";
import type { Logger } from "@/core/services";

export type Core = {
    clearData: () => Promise<void>;

    getBudgets: (query: GetBudgetsQuery) => Promise<Budget[]>;
    createBudget: (command: CreateBudgetCommand) => Promise<void>;
    updateBudget: (command: UpdateBudgetCommand) => Promise<void>;
    deleteBudget: (command: DeleteBudgetCommand) => Promise<void>;

    getIncomes: (query: GetIncomesQuery) => Promise<Income[]>;
    getTotalIncome: (query: GetTotalIncomeQuery) => Promise<number>;
    createIncome: (command: CreateIncomeCommand) => Promise<void>;
    updateIncome: (command: UpdateIncomeCommand) => Promise<void>;
    deleteIncome: (command: DeleteIncomeCommand) => Promise<void>;

    getAccounts: (query: GetAccountsQuery) => Promise<Account[]>;
    createAccount: (command: CreateAccountCommand) => Promise<void>;
    updateAccount: (command: UpdateAccountCommand) => Promise<void>;
    deleteAccount: (command: DeleteAccountCommand) => Promise<void>;

    getCategories: (query: GetCategoriesQuery) => Promise<Category[]>;
    createCategory: (command: CreateCategoryCommand) => Promise<void>;
    updateCategory: (command: UpdateCategoryCommand) => Promise<void>;
    deleteCategory: (command: DeleteCategoryCommand) => Promise<void>;

    getExpenses: (query: GetExpensesQuery) => Promise<Expense[]>;
    createExpense: (command: CreateExpenseCommand) => Promise<void>;
    updateExpense: (command: UpdateExpenseCommand) => Promise<void>;
    deleteExpense: (command: DeleteExpenseCommand) => Promise<void>;
};

export type CoreDependencies = {
    logger: Logger;
    commandRepository: CommandRepository;
    queryRepository: QueryRepository;
    clearData: () => Promise<void>;
};

export function createCore(dependencies: CoreDependencies): Core {
    return {
        clearData: () => dependencies.clearData(),

        getBudgets: (query) => getBudgets(dependencies, query),
        createBudget: (command) => createBudget(dependencies, command),
        updateBudget: (command) => updateBudget(dependencies, command),
        deleteBudget: (command) => deleteBudget(dependencies, command),

        getIncomes: (query) => getIncomes(dependencies, query),
        getTotalIncome: (query) => GetTotalIncome(dependencies, query),
        createIncome: (command) => createIncome(dependencies, command),
        updateIncome: (command) => updateIncome(dependencies, command),
        deleteIncome: (command) => deleteIncome(dependencies, command),

        getAccounts: (query) => getAccounts(dependencies, query),
        createAccount: (command) => createAccount(dependencies, command),
        updateAccount: (command) => updateAccount(dependencies, command),
        deleteAccount: (command) => deleteAccount(dependencies, command),

        getCategories: (query) => getCategories(dependencies, query),
        createCategory: (command) => createCategory(dependencies, command),
        updateCategory: (command) => updateCategory(dependencies, command),
        deleteCategory: (command) => deleteCategory(dependencies, command),

        getExpenses: (query) => getExpenses(dependencies, query),
        createExpense: (command) => createExpense(dependencies, command),
        updateExpense: (command) => updateExpense(dependencies, command),
        deleteExpense: (command) => deleteExpense(dependencies, command),
    };
}
