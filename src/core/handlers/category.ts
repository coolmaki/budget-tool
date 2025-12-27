import { type CoreDependencies } from "@/core";
import { Category } from "@/core/entities/category";
import { CategoryHasAssociatedExpensesError, CategoryNotFound } from "@/core/errors";
import * as Models from "@/core/models";
import { generateId } from "@/utils/id";

export type GetCategoriesQuery = {
    budgetId: string;
    search: string;
};

export type CreateCategoryCommand = {
    budgetId: string;
    name: string;
    color: string;
};

export type UpdateCategoryCommand = {
    budgetId: string;
    id: string;
    name: string;
    color: string;
};

export type DeleteCategoryCommand = {
    budgetId: string;
    id: string;
};

export function getCategories({ queryRepository }: CoreDependencies, query: GetCategoriesQuery): Promise<Models.Category[]> {
    const accounts = queryRepository.getCategories({ budgetId: query.budgetId, search: query.search });

    return Promise.resolve(accounts);
}

export function createCategory({ commandRepository }: CoreDependencies, command: CreateCategoryCommand): Promise<void> {
    const entity: Category = {
        budgetId: command.budgetId,
        id: generateId(),
        name: command.name,
        color: command.color,
    };

    commandRepository.createCategory(entity);

    return Promise.resolve();
}

export function updateCategory({ commandRepository, queryRepository }: CoreDependencies, command: UpdateCategoryCommand): Promise<void> {
    const entity = queryRepository.getCategory({
        budgetId: command.budgetId,
        id: command.id,
    });

    if (!entity) {
        const error = new CategoryNotFound({
            budgetId: command.budgetId,
            id: command.id,
        });

        return Promise.reject(error);
    }

    entity.name = command.name;
    entity.color = command.color;

    commandRepository.updateCategory(entity);

    return Promise.resolve();
}

export function deleteCategory({ commandRepository, queryRepository }: CoreDependencies, command: DeleteCategoryCommand): Promise<void> {
    const entity = queryRepository.getCategory({
        budgetId: command.budgetId,
        id: command.id,
    });

    if (!entity) {
        const error = new CategoryNotFound({
            budgetId: command.budgetId,
            id: command.id,
        });

        return Promise.reject(error);
    }

    const expenses = queryRepository.getExpenses({
        budgetId: command.budgetId,
        categoryId: command.id,
    });

    if (expenses.length > 0) {
        throw new CategoryHasAssociatedExpensesError({
            budgetId: command.budgetId,
            categoryId: command.id,
        });
    }

    commandRepository.deleteCategory(entity);

    return Promise.resolve();
}