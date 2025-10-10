import { CoreDependencies } from "@/core";
import { BudgetNameAlreadyUsedError, BudgetNotFound } from "@/core/errors";
import { Budget } from "@/core/models";
import { generateId } from "@/utils/id";

export type GetBudgetsQuery = { search: string };

export type CreateBudgetCommand = { name: string };
export type UpdateBudgetCommand = { budget: Budget };
export type DeleteBudgetCommand = { budget: Budget };

export function getBudgets({ queryRepository }: CoreDependencies, query: GetBudgetsQuery): Promise<Budget[]> {
    const budgets = queryRepository
        .getBudgets({ search: query.search })
        .map(entity => ({ id: entity.id, name: entity.name } satisfies Budget));

    return Promise.resolve(budgets);
}

export function createBudget({ commandRepository, queryRepository }: CoreDependencies, command: CreateBudgetCommand): Promise<void> {
    const exists = queryRepository.budgetNameExists({ name: command.name });

    if (exists) {
        const error = new BudgetNameAlreadyUsedError(command.name);
        return Promise.reject(error)
    }

    const entity = {
        id: generateId(),
        name: command.name,
    };

    commandRepository.createBudget(entity);

    return Promise.resolve();
}

export function updateBudget({ commandRepository, queryRepository }: CoreDependencies, command: UpdateBudgetCommand): Promise<void> {
    const exists = queryRepository.budgetExists({ id: command.budget.id });

    if (!exists) {
        const error = new BudgetNotFound(command.budget.id);
        return Promise.reject(error);
    }

    const nameExists = queryRepository.budgetNameExists({ name: command.budget.name });

    if (nameExists) {
        const error = new BudgetNameAlreadyUsedError(command.budget.name);
        return Promise.reject(error);
    }

    commandRepository.updateBudget(command.budget);

    return Promise.resolve();
}

export function deleteBudget({ commandRepository, queryRepository }: CoreDependencies, command: DeleteBudgetCommand): Promise<void> {
    const exists = queryRepository.budgetExists({ id: command.budget.id });

    if (!exists) {
        const error = new BudgetNotFound(command.budget.id);
        return Promise.reject(error);
    }

    commandRepository.deleteBudget(command.budget);

    return Promise.resolve();
}
