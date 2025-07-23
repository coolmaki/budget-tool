import { Budget } from "@/core/models";
import { CommandRepository, QueryRepository } from "@/core/repositories";
import { Logger } from "@/core/services";
import { generateId } from "@/utils/id";
import { BudgetNameAlreadyUsedError } from "./errors";

export type CreateBudgetCommand = { name: string };

export type Core = {
    clearData: () => Promise<void>;
    getBudgets: () => Promise<Budget[]>;
    createBudget: (command: CreateBudgetCommand) => Promise<void>;
};

export type CoreDependencies = {
    logger: Logger;
    commandRepository: CommandRepository;
    queryRepository: QueryRepository;
    onDataCleared: () => Promise<void>;
};

export function createCore(dependencies: CoreDependencies): Core {
    return {
        clearData: () => clearData(dependencies),
        getBudgets: () => getBudgets(dependencies),
        createBudget: (command) => createBudget(dependencies, command),
    };
}

async function clearData({ onDataCleared }: CoreDependencies): Promise<void> {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry("core.db");
    await onDataCleared();
}

function getBudgets({ queryRepository }: CoreDependencies): Promise<Budget[]> {
    const budgets = queryRepository
        .getBudgets({})
        .map(entity => ({ id: entity.id, name: entity.name } satisfies Budget));

    return Promise.resolve(budgets);
}

function createBudget({ commandRepository, queryRepository }: CoreDependencies, command: CreateBudgetCommand): Promise<void> {
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