import type { Account } from "@/core/entities/account";
import type { Budget } from "@/core/entities/budget";
import type { Category } from "@/core/entities/category";
import type { Expense } from "@/core/entities/expense";
import type { Income } from "@/core/entities/income";
import type { CommandRepository } from "@/core/repositories";
import { createAuditRepository } from "@/data/audits";
import type { Database } from "@sqlite.org/sqlite-wasm";

enum CommandScript {
    clear_account_expenses,
    clear_category_expenses,
    create_account,
    create_budget,
    create_category,
    create_expense,
    create_income,
    delete_account,
    delete_budget,
    delete_category,
    delete_expense,
    delete_income,
    update_account,
    update_budget,
    update_category,
    update_expense,
    update_income,
};

export class CommandScriptManager {
    private static readonly _scripts: { [path: string]: string } = {};

    public static async initialize(): Promise<void> {
        const globs = import.meta.glob<string>("/src/data/scripts/commands/*.sql", { query: "?raw", import: "default" });

        const scriptLoaders = Object
            .keys(globs)
            .map(key => ({ path: key, load: globs[key] }));

        for (let i = 0; i < scriptLoaders.length; i++) {
            const loader = scriptLoaders[i];
            this._scripts[loader.path] = await loader.load();
        }
    }

    public static load(script: CommandScript): string {
        const name = `${CommandScript[script]}.sql`;

        const key = Object
            .keys(this._scripts)
            .find(key => key.endsWith(name));

        if (!key) {
            throw new Error(`No such command ${name}`);
        }

        return this._scripts[key];
    }
}

export function createCommandRepository(getDatabase: () => Database): CommandRepository {
    const commandRepositoryProxy = new Proxy({} as CommandRepository, {
        get: (_, prop: string) => {
            return (command: any) => {
                getDatabase().transaction(transaction => {
                    const commandRepository = createCommandRepositoryInternal(() => transaction);
                    (commandRepository as any)[prop](command);

                    const auditRepository = createAuditRepository(transaction);
                    auditRepository.log({ command: prop, data: command });
                });
            };
        },
    });

    return commandRepositoryProxy;
}

function createCommandRepositoryInternal(getDatabase: () => Database): CommandRepository {
    return {
        createBudget: (command) => createBudget(getDatabase(), command),
        updateBudget: (command) => updateBudget(getDatabase(), command),
        deleteBudget: (command) => deleteBudget(getDatabase(), command),
        createIncome: (command) => createIncome(getDatabase(), command),
        updateIncome: (command) => updateIncome(getDatabase(), command),
        deleteIncome: (command) => deleteIncome(getDatabase(), command),
        createAccount: (command) => createAccount(getDatabase(), command),
        updateAccount: (command) => updateAccount(getDatabase(), command),
        deleteAccount: (command) => deleteAccount(getDatabase(), command),
        createCategory: (command) => createCategory(getDatabase(), command),
        updateCategory: (command) => updateCategory(getDatabase(), command),
        deleteCategory: (command) => deleteCategory(getDatabase(), command),
        createExpense: (command) => createExpense(getDatabase(), command),
        updateExpense: (command) => updateExpense(getDatabase(), command),
        deleteExpense: (command) => deleteExpense(getDatabase(), command),
    };
}

// ------------------------------------------------------------
// Budgets
// ------------------------------------------------------------

function createBudget(db: Database, budget: Budget): void {
    const sql = CommandScriptManager.load(CommandScript.create_budget);
    const params = {
        $id: budget.id,
        $name: budget.name,
    };

    db.exec({ sql: sql, bind: params });
};

function updateBudget(db: Database, budget: Budget): void {
    const sql = CommandScriptManager.load(CommandScript.update_budget);
    const params = {
        $id: budget.id,
        $name: budget.name,
    };

    db.exec({ sql: sql, bind: params });
};

function deleteBudget(db: Database, budget: Budget): void {
    const sql = CommandScriptManager.load(CommandScript.delete_budget);
    const params = {
        $id: budget.id,
    };

    db.exec({ sql: sql, bind: params });
};

// ------------------------------------------------------------
// Income
// ------------------------------------------------------------

function createIncome(db: Database, income: Income): void {
    const sql = CommandScriptManager.load(CommandScript.create_income);
    const params = {
        $budgetId: income.budgetId,
        $id: income.id,
        $name: income.name,
        $periodType: income.period.type,
        $periodAmount: income.period.amount,
        $amount: income.amount,
    };

    db.exec({ sql: sql, bind: params });
};

function updateIncome(db: Database, income: Income): void {
    const sql = CommandScriptManager.load(CommandScript.update_income);
    const params = {
        $budgetId: income.budgetId,
        $id: income.id,
        $name: income.name,
        $periodType: income.period.type,
        $periodAmount: income.period.amount,
        $amount: income.amount,
    };

    db.exec({ sql: sql, bind: params });
};

function deleteIncome(db: Database, income: Income): void {
    const sql = CommandScriptManager.load(CommandScript.delete_income);
    const params = {
        $budgetId: income.budgetId,
        $id: income.id,
    };

    db.exec({ sql: sql, bind: params });
};

// ------------------------------------------------------------
// Accounts
// ------------------------------------------------------------

function createAccount(db: Database, account: Account): void {
    const sql = CommandScriptManager.load(CommandScript.create_account);
    const params = {
        $budgetId: account.budgetId,
        $id: account.id,
        $name: account.name,
    };

    db.exec({ sql: sql, bind: params });
};

function updateAccount(db: Database, account: Account): void {
    const sql = CommandScriptManager.load(CommandScript.update_account);
    const params = {
        $budgetId: account.budgetId,
        $id: account.id,
        $name: account.name,
    };

    db.exec({ sql: sql, bind: params });
};

function deleteAccount(db: Database, account: Account): void {
    clearAccountExpenses(db, account);

    const sql = CommandScriptManager.load(CommandScript.delete_account);
    const params = {
        $budgetId: account.budgetId,
        $id: account.id,
    };

    db.exec({ sql: sql, bind: params });
};

function clearAccountExpenses(db: Database, account: Account): void {
    const sql = CommandScriptManager.load(CommandScript.clear_account_expenses);
    const params = {
        $budgetId: account.budgetId,
        $accountId: account.id,
    };

    db.exec({ sql: sql, bind: params });
}

// ------------------------------------------------------------
// Categories
// ------------------------------------------------------------

function createCategory(db: Database, category: Category): void {
    const sql = CommandScriptManager.load(CommandScript.create_category);
    const params = {
        $budgetId: category.budgetId,
        $id: category.id,
        $name: category.name,
        $color: category.color,
    };

    db.exec({ sql: sql, bind: params });
};

function updateCategory(db: Database, category: Category): void {
    const sql = CommandScriptManager.load(CommandScript.update_category);
    const params = {
        $budgetId: category.budgetId,
        $id: category.id,
        $name: category.name,
        $color: category.color,
    };

    db.exec({ sql: sql, bind: params });
};

function deleteCategory(db: Database, category: Category): void {
    clearCategoryExpenses(db, category);

    const sql = CommandScriptManager.load(CommandScript.delete_category);
    const params = {
        $budgetId: category.budgetId,
        $id: category.id,
    };

    db.exec({ sql: sql, bind: params });
};

function clearCategoryExpenses(db: Database, category: Category): void {
    const sql = CommandScriptManager.load(CommandScript.clear_category_expenses);
    const params = {
        $budgetId: category.budgetId,
        $categoryId: category.id,
    };

    db.exec({ sql: sql, bind: params });
}

// ------------------------------------------------------------
// Expenses
// ------------------------------------------------------------

function createExpense(db: Database, expense: Expense): void {
    const sql = CommandScriptManager.load(CommandScript.create_expense);
    const params = {
        $budgetId: expense.budgetId,
        $id: expense.id,
        $name: expense.name,
        $categoryId: expense.categoryId,
        $accountId: expense.accountId,
        $amount: expense.amount,
        $periodType: expense.period.type,
        $periodAmount: expense.period.amount,
    };

    db.exec({ sql: sql, bind: params });
}

function updateExpense(db: Database, expense: Expense): void {
    const sql = CommandScriptManager.load(CommandScript.update_expense);
    const params = {
        $budgetId: expense.budgetId,
        $id: expense.id,
        $name: expense.name,
        $categoryId: expense.categoryId,
        $accountId: expense.accountId,
        $amount: expense.amount,
        $periodType: expense.period.type,
        $periodAmount: expense.period.amount,
    };

    db.exec({ sql: sql, bind: params });
}

function deleteExpense(db: Database, expense: Expense): void {
    const sql = CommandScriptManager.load(CommandScript.delete_expense);
    const params = {
        $budgetId: expense.budgetId,
        $id: expense.id,
    };

    db.exec({ sql: sql, bind: params });
};