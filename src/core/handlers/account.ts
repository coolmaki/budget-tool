import { type CoreDependencies } from "@/core";
import { Account } from "@/core/entities/account";
import { AccountNotFound } from "@/core/errors";
import * as Models from "@/core/models";
import { generateId } from "@/utils/id";

export type GetAccountsQuery = {
    budgetId: string;
    search: string;
};

export type CreateAccountCommand = {
    budgetId: string;
    name: string;
};

export type UpdateAccountCommand = {
    budgetId: string;
    id: string;
    name: string;
};

export type DeleteAccountCommand = {
    budgetId: string;
    id: string;
};

export function getAccounts({ queryRepository }: CoreDependencies, query: GetAccountsQuery): Promise<Models.Account[]> {
    const accounts = queryRepository.getAccounts({ budgetId: query.budgetId, search: query.search });

    return Promise.resolve(accounts);
}

export function createAccount({ commandRepository }: CoreDependencies, command: CreateAccountCommand): Promise<void> {
    const entity: Account = {
        budgetId: command.budgetId,
        id: generateId(),
        name: command.name,
    };

    commandRepository.createAccount(entity);

    return Promise.resolve();
}

export function updateAccount({ commandRepository, queryRepository }: CoreDependencies, command: UpdateAccountCommand): Promise<void> {
    const entity = queryRepository.getAccount({
        budgetId: command.budgetId,
        id: command.id,
    });

    if (!entity) {
        const error = new AccountNotFound({
            budgetId: command.budgetId,
            id: command.id,
        });

        return Promise.reject(error);
    }

    entity.name = command.name;

    commandRepository.updateAccount(entity);

    return Promise.resolve();
}

export function deleteAccount({ commandRepository, queryRepository }: CoreDependencies, command: DeleteAccountCommand): Promise<void> {
    const entity = queryRepository.getAccount({
        budgetId: command.budgetId,
        id: command.id,
    });

    if (!entity) {
        const error = new AccountNotFound({
            budgetId: command.budgetId,
            id: command.id,
        });

        return Promise.reject(error);
    }

    commandRepository.deleteAccount(entity);

    return Promise.resolve();
}