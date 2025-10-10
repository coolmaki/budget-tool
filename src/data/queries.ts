import { Account } from "@/core/entities/account";
import type { Budget } from "@/core/entities/budget";
import { Category } from "@/core/entities/category";
import { Expense } from "@/core/entities/expense";
import { Income } from "@/core/entities/income";
import * as Models from "@/core/models";
import type { AccountExistsQuery, BudgetExistsQuery, BudgetNameExistsQuery, CategoryExistsQuery, ExpenseExistsQuery, GetAccountQuery, GetAccountsQuery, GetBudgetsQuery, GetCategoriesQuery, GetCategoryQuery, GetExpenseQuery, GetExpensesQuery, GetIncomeQuery, GetIncomesQuery, IncomeExistsQuery, TotalIncomeQuery } from "@/core/queries";
import type { QueryRepository } from "@/core/repositories";
import type { PeriodType } from "@/core/types";
import type { BindingSpec, Database, SqlValue } from "@sqlite.org/sqlite-wasm";

enum QueryScript {
    account_exists,
    budget_exists,
    budget_name_exists,
    category_exists,
    expense_exists,
    get_account,
    get_accounts,
    get_budgets,
    get_categories,
    get_category,
    get_expense,
    get_expenses,
    get_income,
    get_incomes,
    income_exists,
    total_income,
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

function parseRowToIncome(row: { [columnName: string]: SqlValue }): Income {
    return {
        budgetId: row["budget_id"]!.valueOf() as string,
        id: row["id"]!.valueOf() as string,
        name: row["name"]!.valueOf() as string,
        period: {
            type: row["period_type"]!.valueOf() as PeriodType,
            amount: row["period_amount"]!.valueOf() as number,
        },
        amount: row["amount"]!.valueOf() as number,
    };
}

function parseRowToAccount(row: { [columnName: string]: SqlValue }): Account {
    return {
        budgetId: row["budget_id"]!.valueOf() as string,
        id: row["id"]!.valueOf() as string,
        name: row["name"]!.valueOf() as string,
    };
}

function parseRowToAccountModel(row: { [columnName: string]: SqlValue }): Models.Account {
    return {
        id: row["id"]!.valueOf() as string,
        name: row["name"]!.valueOf() as string,
        total: row["total"]!.valueOf() as number,
    };
}

function parseRowToCategory(row: { [columnName: string]: SqlValue }): Category {
    return {
        budgetId: row["budget_id"]!.valueOf() as string,
        id: row["id"]!.valueOf() as string,
        name: row["name"]!.valueOf() as string,
        color: row["color"]!.valueOf() as string,
    };
}

function parseRowToCategoryModel(row: { [columnName: string]: SqlValue }): Models.Category {
    return {
        id: row["id"]!.valueOf() as string,
        name: row["name"]!.valueOf() as string,
        color: row["color"]!.valueOf() as string,
        total: row["total"]!.valueOf() as number,
    };
}

function parseRowToExpense(row: { [columnName: string]: SqlValue }): Expense {
    return {
        budgetId: row["budget_id"]!.valueOf() as string,
        id: row["id"]!.valueOf() as string,
        name: row["name"]!.valueOf() as string,
        period: {
            type: row["period_type"]!.valueOf() as PeriodType,
            amount: row["period_amount"]!.valueOf() as number,
        },
        amount: row["amount"]!.valueOf() as number,
        categoryId: row["category_id"]!.valueOf() as string,
        accountId: row["account_id"]!.valueOf() as string,
    };
}

function parseRowToExpenseModel(row: { [columnName: string]: SqlValue }): Models.Expense {
    return {
        id: row["id"]!.valueOf() as string,
        name: row["name"]!.valueOf() as string,
        period: {
            type: row["period_type"]!.valueOf() as PeriodType,
            amount: row["period_amount"]!.valueOf() as number,
        },
        amount: row["amount"]!.valueOf() as number,
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

export function createQueryRepository(getDatabase: () => Database): QueryRepository {
    return {
        getBudgets: (query) => getBudgets(getDatabase(), query),
        budgetExists: (query) => budgetExists(getDatabase(), query),
        budgetNameExists: (query) => budgetNameExists(getDatabase(), query),
        getIncome: (query) => getIncome(getDatabase(), query),
        getIncomes: (query) => getIncomes(getDatabase(), query),
        incomeExists: (query) => incomeExists(getDatabase(), query),
        totalIncome: (query) => totalIncome(getDatabase(), query),
        getAccount: (query) => getAccount(getDatabase(), query),
        getAccounts: (query) => getAccounts(getDatabase(), query),
        getCategory: (query) => getCategory(getDatabase(), query),
        getCategories: (query) => getCategories(getDatabase(), query),
        categoryExists: (query) => categoryExists(getDatabase(), query),
        accountExists: (query) => accountExists(getDatabase(), query),
        getExpense: (query) => getExpense(getDatabase(), query),
        getExpenses: (query) => getExpenses(getDatabase(), query),
        expenseExists: (query) => expenseExists(getDatabase(), query),
    };
}

function exists(db: Database, sql: string, bind?: BindingSpec): boolean {
    return !!(db.selectValue(sql, bind)?.valueOf());
}

function singleValue<T>(db: Database, sql: string, bind?: BindingSpec): T {
    const result = db.selectValue(sql, bind)
    const value = result?.valueOf();
    return value as T;
}

function getBudgets(db: Database, query: GetBudgetsQuery): Budget[] {
    const sql = QueryScriptManager.load(QueryScript.get_budgets);
    const bind = parseQuery(query);
    const result = db.selectObjects(sql, bind).map(parseRowToBudget);
    return result;
}

function budgetExists(db: Database, query: BudgetExistsQuery): boolean {
    const sql = QueryScriptManager.load(QueryScript.budget_exists);
    const bind = parseQuery(query);
    const result = exists(db, sql, bind);
    return result;
}

function budgetNameExists(db: Database, query: BudgetNameExistsQuery): boolean {
    const sql = QueryScriptManager.load(QueryScript.budget_name_exists);
    const bind = parseQuery(query);
    const result = exists(db, sql, bind);
    return result;
}

function getIncome(db: Database, query: GetIncomeQuery): Income | null {
    const sql = QueryScriptManager.load(QueryScript.get_income);
    const bind = parseQuery(query);
    const result = db.selectObject(sql, bind);
    const income = result ? parseRowToIncome(result) : null;
    return income;
}

function getIncomes(db: Database, query: GetIncomesQuery): Income[] {
    const sql = QueryScriptManager.load(QueryScript.get_incomes);
    const bind = parseQuery(query);
    const result = db.selectObjects(sql, bind).map(parseRowToIncome);
    return result;
}

function incomeExists(db: Database, query: IncomeExistsQuery): boolean {
    const sql = QueryScriptManager.load(QueryScript.income_exists);
    const bind = parseQuery(query);
    const result = exists(db, sql, bind);
    return result;
}

function totalIncome(db: Database, query: TotalIncomeQuery): number {
    const sql = QueryScriptManager.load(QueryScript.total_income);
    const bind = parseQuery(query);
    const result = singleValue<number>(db, sql, bind);
    return result;
}

function getAccount(db: Database, query: GetAccountQuery): Account | null {
    const sql = QueryScriptManager.load(QueryScript.get_account);
    const bind = parseQuery(query);
    const result = db.selectObject(sql, bind);
    const account = result ? parseRowToAccount(result) : null;
    return account;
}

function getAccounts(db: Database, query: GetAccountsQuery): Models.Account[] {
    const sql = QueryScriptManager.load(QueryScript.get_accounts);
    const bind = parseQuery(query);
    const result = db.selectObjects(sql, bind).map(parseRowToAccountModel);
    return result;
}

function accountExists(db: Database, query: AccountExistsQuery): boolean {
    const sql = QueryScriptManager.load(QueryScript.account_exists);
    const bind = parseQuery(query);
    const result = exists(db, sql, bind);
    return result;
}

function getCategory(db: Database, query: GetCategoryQuery): Category | null {
    const sql = QueryScriptManager.load(QueryScript.get_category);
    const bind = parseQuery(query);
    const result = db.selectObject(sql, bind);
    const category = result ? parseRowToCategory(result) : null;
    return category;
}

function getCategories(db: Database, query: GetCategoriesQuery): Models.Category[] {
    const sql = QueryScriptManager.load(QueryScript.get_categories);
    const bind = parseQuery(query);
    const result = db.selectObjects(sql, bind).map(parseRowToCategoryModel);
    return result;
}

function categoryExists(db: Database, query: CategoryExistsQuery): boolean {
    const sql = QueryScriptManager.load(QueryScript.category_exists);
    const bind = parseQuery(query);
    const result = exists(db, sql, bind);
    return result;
}

function getExpense(db: Database, query: GetExpenseQuery): Expense | null {
    const sql = QueryScriptManager.load(QueryScript.get_expense);
    const bind = parseQuery(query);
    const result = db.selectObject(sql, bind);
    const expense = result ? parseRowToExpense(result) : null;
    return expense;
}

function getExpenses(db: Database, query: GetExpensesQuery): Models.Expense[] {
    const sql = QueryScriptManager.load(QueryScript.get_expenses);
    const bind = parseQuery(query);
    const result = db.selectObjects(sql, bind).map(parseRowToExpenseModel);
    return result;
}

function expenseExists(db: Database, query: ExpenseExistsQuery): boolean {
    const sql = QueryScriptManager.load(QueryScript.expense_exists);
    const bind = parseQuery(query);
    const result = exists(db, sql, bind);
    return result;
}
