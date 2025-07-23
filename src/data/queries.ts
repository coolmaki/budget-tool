import { amountFromNormalized } from "@/core/helpers";
import type { Account, Budget, Category, Expense } from "@/core/models";
import { AccountExistsQuery, BudgetExistsQuery, BudgetNameExistsQuery, CategoryExistsQuery, ExpenseExistsQuery, GetBudgetsQuery } from "@/core/queries";
import type { QueryRepository } from "@/core/repositories";
import type { BindingSpec, Database, SqlValue } from "@sqlite.org/sqlite-wasm";

enum QueryScript {
    account_exists,
    budget_exists,
    budget_name_exists,
    category_exists,
    expense_exists,
    get_accounts,
    get_budgets,
    get_categories,
    get_expenses,
};

export class QueryScriptManager {
    private static readonly _scripts: { [path: string]: string } = {};

    public static async initialize(): Promise<void> {
        const globs = import.meta.glob<string>("/src/data/scripts/queries/*.sql", { query: "?raw", import: "default" });

        const scriptLoaders = Object
            .keys(globs)
            .map(key => ({ path: key, load: globs[key] }));

        for (let i = 0; i < scriptLoaders.length; i++) {
            const loader = scriptLoaders[i];
            this._scripts[loader.path] = await loader.load();
        }
    }

    public static load(script: QueryScript): string {
        const name = `${QueryScript[script]}.sql`;

        const key = Object
            .keys(this._scripts)
            .find(key => key.endsWith(name));

        if (!key) {
            throw new Error(`No such query ${name}`);
        }

        return this._scripts[key];
    }
}

function parseRowToBudget(row: { [columnName: string]: SqlValue }): Budget {
    return {
        id: row["id"]!.valueOf() as string,
        name: row["name"]!.valueOf() as string,
    };
}

function parseRowToCategory(row: { [columnName: string]: SqlValue }): Category {
    return {
        id: row["id"]!.valueOf() as string,
        name: row["name"]!.valueOf() as string,
    };
}

function parseRowToAccount(row: { [columnName: string]: SqlValue }): Account {
    return {
        id: row["id"]!.valueOf() as string,
        name: row["name"]!.valueOf() as string,
        total: row["total"]!.valueOf() as number,
    };
}

function parseRowToExpense(row: { [columnName: string]: SqlValue }): Expense {
    const amount = row["amount"]!.valueOf() as number;

    return {
        id: row["id"]!.valueOf() as string,
        name: row["name"]!.valueOf() as string,
        amount: amountFromNormalized(amount),
        category: {
            id: row["category_id"]!.valueOf() as string,
            name: row["category_name"]!.valueOf() as string,
        },
        account: {
            id: row["account_id"]!.valueOf() as string,
            name: row["account_name"]!.valueOf() as string,
        },
    };
}

function parseQuery<T extends Record<string, any>>(query: T): BindingSpec | undefined {
    const result: any = {};

    for (const key in query) {
        if (Object.prototype.hasOwnProperty.call(query, key)) {
            result[`$${key}`] = query[key];
        }
    }

    return result;
}

export function createQueryRepository(db: Database): QueryRepository {
    function exists(sql: string, bind?: BindingSpec): boolean {
        return !!(db.selectValue(sql, bind)?.valueOf());
    }

    return {
        getBudgets: (query: GetBudgetsQuery): Budget[] => {
            const sql = QueryScriptManager.load(QueryScript.get_budgets);
            const bind = parseQuery(query);
            const result = db.selectObjects(sql, bind).map(parseRowToBudget);
            return result;
        },

        budgetExists: (query: BudgetExistsQuery): boolean => {
            const sql = QueryScriptManager.load(QueryScript.budget_exists);
            const bind = parseQuery(query);
            const result = exists(sql, bind);
            return result;
        },

        budgetNameExists: (query: BudgetNameExistsQuery): boolean => {
            const sql = QueryScriptManager.load(QueryScript.budget_name_exists);
            const bind = parseQuery(query);
            const result = exists(sql, bind);
            return result;
        },

        getCategories: (query: { budgetId: string }): Category[] => {
            const sql = QueryScriptManager.load(QueryScript.get_categories);
            const bind = parseQuery(query);
            const result = db.selectObjects(sql, bind).map(parseRowToCategory);
            return result;
        },

        categoryExists: (query: CategoryExistsQuery): boolean => {
            const sql = QueryScriptManager.load(QueryScript.category_exists);
            const bind = parseQuery(query);
            const result = exists(sql, bind);
            return result;
        },

        getAccounts: (query: { budgetId: string }): Account[] => {
            const sql = QueryScriptManager.load(QueryScript.get_accounts);
            const bind = parseQuery(query);
            const result = db.selectObjects(sql, bind).map(parseRowToAccount);
            return result;
        },

        accountExists: (query: AccountExistsQuery): boolean => {
            const sql = QueryScriptManager.load(QueryScript.account_exists);
            const bind = parseQuery(query);
            const result = exists(sql, bind);
            return result;
        },

        getExpenses: (query: { budgetId: string, name?: string, categoryId?: string, accountId?: string }): Expense[] => {
            const sql = QueryScriptManager.load(QueryScript.get_expenses);
            const bind = parseQuery(query);
            const result = db.selectObjects(sql, bind).map(parseRowToExpense);
            return result;
        },

        expenseExists: (query: ExpenseExistsQuery): boolean => {
            const sql = QueryScriptManager.load(QueryScript.expense_exists);
            const bind = parseQuery(query);
            const result = exists(sql, bind);
            return result;
        },
    };
}
