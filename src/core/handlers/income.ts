import { type CoreDependencies } from "@/core";
import { Income } from "@/core/entities/income";
import { IncomeNotFound } from "@/core/errors";
import * as Models from "@/core/models";
import { type Period } from "@/core/types";
import { generateId } from "@/utils/id";

export type GetIncomesQuery = {
    budgetId: string;
    search: string;
};

export type GetTotalIncomeQuery = {
    budgetId: string;
};

export type CreateIncomeCommand = {
    budgetId: string;
    name: string;
    period: Period;
    amount: number;
};

export type UpdateIncomeCommand = {
    budgetId: string;
    id: string;
    name: string;
    period: Period;
    amount: number;
};

export type DeleteIncomeCommand = {
    budgetId: string;
    id: string;
};

export function getIncomes({ queryRepository }: CoreDependencies, query: GetIncomesQuery): Promise<Models.Income[]> {
    const incomes = queryRepository.getIncomes({ budgetId: query.budgetId, search: query.search });

    return Promise.resolve(incomes);
}

export function GetTotalIncome({ queryRepository }: CoreDependencies, query: GetTotalIncomeQuery): Promise<number> {
    const total = queryRepository.totalIncome({ budgetId: query.budgetId });

    return Promise.resolve(total);
}

export function createIncome({ commandRepository }: CoreDependencies, command: CreateIncomeCommand): Promise<void> {
    const entity: Income = {
        budgetId: command.budgetId,
        id: generateId(),
        name: command.name,
        period: command.period,
        amount: command.amount,
    };

    commandRepository.createIncome(entity);

    return Promise.resolve();
}

export function updateIncome({ commandRepository, queryRepository }: CoreDependencies, command: UpdateIncomeCommand): Promise<void> {
    const entity = queryRepository.getIncome({
        budgetId: command.budgetId,
        id: command.id,
    });

    if (!entity) {
        const error = new IncomeNotFound({
            budgetId: command.budgetId,
            id: command.id,
        });

        return Promise.reject(error);
    }

    entity.name = command.name;
    entity.period = command.period;
    entity.amount = command.amount;

    commandRepository.updateIncome(entity);

    return Promise.resolve();
}

export function deleteIncome({ commandRepository, queryRepository }: CoreDependencies, command: DeleteIncomeCommand): Promise<void> {
    const entity = queryRepository.getIncome({
        budgetId: command.budgetId,
        id: command.id,
    });

    if (!entity) {
        const error = new IncomeNotFound({
            budgetId: command.budgetId,
            id: command.id,
        });

        return Promise.reject(error);
    }

    commandRepository.deleteIncome(entity);

    return Promise.resolve();
}