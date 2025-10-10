import { type CoreDependencies } from "@/core";
import { Expense } from "@/core/entities/expense";
import { AccountNotFound, CategoryNotFound, ExpenseNotFound } from "@/core/errors";
import * as Models from "@/core/models";
import { type Period } from "@/core/types";
import { generateId } from "@/utils/id";

export type GetExpensesQuery = {
    budgetId: string;
    search?: string;
    categoryId?: string;
    accountId?: string;
};

export type CreateExpenseCommand = {
    budgetId: string;
    name: string;
    categoryId: string;
    accountId: string;
    period: Period;
    amount: number;
};

export type UpdateExpenseCommand = {
    budgetId: string;
    id: string;
    name: string;
    categoryId: string;
    accountId: string;
    period: Period;
    amount: number;
};

export type DeleteExpenseCommand = {
    budgetId: string;
    id: string;
};

export function getExpenses({ queryRepository }: CoreDependencies, query: GetExpensesQuery): Promise<Models.Expense[]> {
    const expense = queryRepository.getExpenses({
        budgetId: query.budgetId,
        search: query.search,
        categoryId: query.categoryId,
        accountId: query.accountId,
    });

    return Promise.resolve(expense);
}

export function createExpense({ commandRepository, queryRepository }: CoreDependencies, command: CreateExpenseCommand): Promise<void> {
    const categoryExists = queryRepository.categoryExists({ budgetId: command.budgetId, id: command.categoryId });

    if (!categoryExists) {
        const error = new CategoryNotFound({
            budgetId: command.budgetId,
            id: command.categoryId,
        });

        return Promise.reject(error);
    }

    const accountExists = queryRepository.accountExists({ budgetId: command.budgetId, id: command.accountId });

    if (!accountExists) {
        const error = new AccountNotFound({
            budgetId: command.budgetId,
            id: command.accountId,
        });

        return Promise.reject(error);
    }

    const entity: Expense = {
        budgetId: command.budgetId,
        id: generateId(),
        name: command.name,
        period: command.period,
        amount: command.amount,
        categoryId: command.categoryId,
        accountId: command.accountId,
    };

    commandRepository.createExpense(entity);

    return Promise.resolve();
}

export function updateExpense({ commandRepository, queryRepository }: CoreDependencies, command: UpdateExpenseCommand): Promise<void> {
    const categoryExists = queryRepository.categoryExists({ budgetId: command.budgetId, id: command.categoryId });

    if (!categoryExists) {
        const error = new CategoryNotFound({
            budgetId: command.budgetId,
            id: command.categoryId,
        });

        return Promise.reject(error);
    }

    const accountExists = queryRepository.accountExists({ budgetId: command.budgetId, id: command.accountId });

    if (!accountExists) {
        const error = new AccountNotFound({
            budgetId: command.budgetId,
            id: command.accountId,
        });

        return Promise.reject(error);
    }

    const entity = queryRepository.getExpense({
        budgetId: command.budgetId,
        id: command.id,
    });

    if (!entity) {
        const error = new ExpenseNotFound({
            budgetId: command.budgetId,
            id: command.id,
        });

        return Promise.reject(error);
    }

    entity.name = command.name;
    entity.period = command.period;
    entity.amount = command.amount;
    entity.categoryId = command.categoryId;
    entity.accountId = command.accountId;

    commandRepository.updateExpense(entity);

    return Promise.resolve();
}

export function deleteExpense({ commandRepository, queryRepository }: CoreDependencies, command: DeleteExpenseCommand): Promise<void> {
    const entity = queryRepository.getExpense({
        budgetId: command.budgetId,
        id: command.id,
    });

    if (!entity) {
        const error = new ExpenseNotFound({
            budgetId: command.budgetId,
            id: command.id,
        });

        return Promise.reject(error);
    }

    commandRepository.deleteExpense(entity);

    return Promise.resolve();
}