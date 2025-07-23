import type { Account, Budget, Category, Expense } from "@/core/entities";
import type { CommandRepository } from "@/core/repositories";
import { createAuditRepository } from "@/data/audits";
import type { Database } from "@sqlite.org/sqlite-wasm";

enum CommandScript {
    create_account,
    create_budget,
    create_category,
    create_expense,
    update_account,
    update_budget,
    update_category,
    update_expense,
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

function createCommandRepositoryInternal(db: Database): CommandRepository {
    return {
        // ------------------------------------------------------------
        // Budgets
        // ------------------------------------------------------------

        createBudget: (budget: Budget): void => {
            const sql = CommandScriptManager.load(CommandScript.create_budget);
            const params = {
                $id: budget.id,
                $name: budget.name,
            };

            db.exec({ sql: sql, bind: params });
        },

        updateBudget: (budget: Budget): void => {
            const sql = CommandScriptManager.load(CommandScript.update_budget);
            const params = {
                $id: budget.id,
                $name: budget.name,
            };

            db.exec({ sql: sql, bind: params });
        },

        // ------------------------------------------------------------
        // Categories
        // ------------------------------------------------------------

        createCategory: (category: Category): void => {
            const sql = CommandScriptManager.load(CommandScript.create_category);
            const params = {
                $budgetId: category.budgetId,
                $id: category.id,
                $name: category.name,
            };

            db.exec({ sql: sql, bind: params });
        },

        updateCategory: (category: Category): void => {
            const sql = CommandScriptManager.load(CommandScript.update_category);
            const params = {
                $budgetId: category.budgetId,
                $id: category.id,
                $name: category.name,
            };

            db.exec({ sql: sql, bind: params });
        },

        // ------------------------------------------------------------
        // Accounts
        // ------------------------------------------------------------

        createAccount: (account: Account): void => {
            const sql = CommandScriptManager.load(CommandScript.create_account);
            const params = {
                $budgetId: account.budgetId,
                $id: account.id,
                $name: account.name,
            };

            db.exec({ sql: sql, bind: params });
        },

        updateAccount: (account: Account): void => {
            const sql = CommandScriptManager.load(CommandScript.update_account);
            const params = {
                $budgetId: account.budgetId,
                $id: account.id,
                $name: account.name,
            };

            db.exec({ sql: sql, bind: params });
        },

        // ------------------------------------------------------------
        // Expenses
        // ------------------------------------------------------------

        createExpense: (expense: Expense): void => {
            const sql = CommandScriptManager.load(CommandScript.create_expense);
            const params = {
                $budgetId: expense.budgetId,
                $id: expense.id,
                $name: expense.name,
                $categoryId: expense.categoryId,
                $accountId: expense.accountId,
                $amount: expense.amount,
            };

            db.exec({ sql: sql, bind: params });
        },

        updateExpense: (expense: Expense): void => {
            const sql = CommandScriptManager.load(CommandScript.update_expense);
            const params = {
                $budgetId: expense.budgetId,
                $id: expense.id,
                $name: expense.name,
                $categoryId: expense.categoryId,
                $accountId: expense.accountId,
                $amount: expense.amount,
            };

            db.exec({ sql: sql, bind: params });
        },
    };
}

export function createCommandRepository(db: Database): CommandRepository {
    const commandRepositoryProxy = new Proxy({} as CommandRepository, {
        get: (_, prop: string) => {
            return (command: any) => {
                db.transaction(transaction => {
                    const commandRepository = createCommandRepositoryInternal(transaction);
                    (commandRepository as any)[prop](command);

                    const auditRepository = createAuditRepository(transaction);
                    auditRepository.log({ command: prop, data: command });
                });
            };
        },
    });

    return commandRepositoryProxy;
}