import { useBudgetContext, useCore } from "@/app/core";
import { useI18n } from "@/app/i18n";
import { useLogging } from "@/app/logging";
import { useNavigation } from "@/app/navigation";
import { convertPeriod } from "@/core/helpers";
import type { Category } from "@/core/models";
import { PeriodType } from "@/core/types";
import ConfirmDialog from "@/ui/components/dialogs/ConfirmDialog";
import FormDialog from "@/ui/components/dialogs/FormDIalog";
import InformationDialog from "@/ui/components/dialogs/InformationDialog";
import ColorPicker from "@/ui/components/form/ColorPicker";
import TextInput from "@/ui/components/form/TextInput";
import List from "@/ui/components/List";
import ListHeader from "@/ui/components/ListHeader";
import Page from "@/ui/templates/Page";
import { ChevronLeft, FrownIcon, InfoIcon, PenIcon, XIcon } from "lucide-solid";
import { createMemo, createSignal, type Component } from "solid-js";
import { createStore, unwrap } from "solid-js/store";

type CategoriesStore = {
    categories: Category[];
    loading: boolean;
}

type EditCategoryStore = {
    id: string | null;
    name: string;
    color?: string;
    showDialog: boolean;
    executing: boolean;
};

type DeleteCategoryStore = {
    category: Category | null;
    showDialog: boolean;
    executing: boolean;
};

const Categories: Component = () => {
    const { t } = useI18n();
    const core = useCore();
    const { pop } = useNavigation();
    const logger = useLogging();
    const [context, _] = useBudgetContext();

    const [showInfo, setShowInfo] = createSignal(false);

    const [searchValue, setSearchValue] = createSignal("");

    const [categoryStore, setCategoryStore] = createStore<CategoriesStore>({
        categories: [],
        loading: false,
    });

    const [editCategoryStore, setEditCategoryStore] = createStore<EditCategoryStore>({
        id: null,
        name: "",
        showDialog: false,
        executing: false,
    });

    const [deleteCategoryStore, setDeleteCategoryStore] = createStore<DeleteCategoryStore>({
        category: null,
        showDialog: false,
        executing: false,
    });

    const isLoading = createMemo(() =>
        categoryStore.loading ||
        editCategoryStore.executing ||
        deleteCategoryStore.executing);

    async function onAppearing(): Promise<void> {
        await loadCategories(searchValue());
    }

    async function loadCategories(search: string): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return;
        }

        setCategoryStore("loading", true);

        await core
            .getCategories({
                budgetId: budgetId,
                search: search,
            })
            .then((category) => setCategoryStore("categories", category))
            .finally(() => {
                setCategoryStore("loading", false);
            });
    }

    function showEditDialog(e: MouseEvent, category?: Category): void {
        e.stopPropagation();

        setEditCategoryStore({
            id: category?.id ?? null,
            name: category?.name ?? "",
            color: category?.color,
            showDialog: true,
            executing: false,
        });
    }

    function saveCategory(): Promise<void> {
        return editCategoryStore.id
            ? editCategory()
            : createCategory();
    }

    function createCategory(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return Promise.resolve();
        }

        setEditCategoryStore("showDialog", false);
        return handleAction(() => core.createCategory({
            budgetId: budgetId,
            name: editCategoryStore.name,
            color: editCategoryStore.color!,
        }));
    }

    function editCategory(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return Promise.resolve();
        }

        setEditCategoryStore("showDialog", false);

        return handleAction(() => core.updateCategory({
            budgetId: budgetId,
            id: editCategoryStore.id!,
            name: editCategoryStore.name,
            color: editCategoryStore.color!,
        }));
    }

    function confirmDeleteCategory(e: MouseEvent, category: Category): void {
        e.stopPropagation();

        setDeleteCategoryStore({
            category: category,
            showDialog: true,
        });
    }

    function deleteCategory(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return Promise.resolve();
        }

        setDeleteCategoryStore("showDialog", false);
        return handleAction(() => core.deleteCategory({
            budgetId: budgetId,
            id: unwrap(deleteCategoryStore.category!.id),
        }));
    }

    async function handleAction(action: () => Promise<void>): Promise<void> {
        await action()
            .then(() => loadCategories(searchValue()))
            .catch(error => {
                // TODO: handle error
                const message = t("Global.Errors.Unhandled");
                logger.error(message, error);
            });
    }

    const CategoryTemplate: Component<{ item: Category }> = (props) => {
        return (
            <div
                class="flex-col bg-surface-200 rounded-surface shadow-sm gap-xs border border-border pb-sm">

                {/* Row 1 */}
                <div class="flex flex-row items-center gap-xs min-h-[5.4rem] h-[5.4rem] pl-md pr-sm">
                    <p class="text-lg flex-1 text-surface-content">{props.item.name}</p>

                    <button
                        type="button"
                        class="button-icon-field shrink-0 bg-info text-error-content"
                        onclick={(e) => showEditDialog(e, props.item)}>
                        <PenIcon size={20} class="mx-auto" />
                    </button>

                    <button
                        type="button"
                        class="button-icon-field shrink-0 bg-error text-error-content rounded-none"
                        onclick={(e) => confirmDeleteCategory(e, props.item)}>
                        <XIcon size={20} class="mx-auto" />
                    </button>
                </div>

                {/* Row 2 */}
                <span class="flex flex-row gap-xs px-md items-center">
                    <span class="text-xl text-primary">
                        {t("Core.CurrencyFormat", convertPeriod({
                            amount: props.item.total,
                            currentPeriod: { amount: 1, type: PeriodType.YEAR },
                            targetPeriod: context.period,
                        }))}
                    </span>

                    <span class="text-md text-medium-emphasis">{t("Core.AmountOverPeriod", context.period)}</span>
                </span>
            </div>
        );
    };

    return (
        <Page
            title={t("CategoriesPage.Title")!}
            leadingIcon={ChevronLeft}
            leadingAction={async () => await pop()}
            trailingIcon={InfoIcon}
            trailingAction={() => setShowInfo(true)}
            onappearing={onAppearing}>

            <InformationDialog
                show={showInfo()}
                title={t("CategoriesPage.Title")!}
                text={t("CategoriesPage.Information")!}
                ondismiss={() => setShowInfo(false)} />

            <ListHeader
                searchPlaceholder={t("CategoriesPage.SearchCategories")}
                onsearch={async (value) => {
                    setSearchValue(value);
                    await loadCategories(value);
                }}
                onadd={(e) => showEditDialog(e)} />

            <hr class="text-border" />

            {/* Content */}
            <main
                class="flex-1 flex flex-col min-h-0 p-sm gap-sm overflow-y-auto"
                classList={{ "justify-center": isLoading() }}>
                <List
                    loading={isLoading()}
                    items={categoryStore.categories}
                    itemTemplate={CategoryTemplate}
                    emptyTemplate={EmptyTemplate} />
            </main>

            {/* Create New Category Dialog */}
            <FormDialog
                show={editCategoryStore.showDialog}
                title={editCategoryStore.id ? t("CategoriesPage.EditCategory")! : t("CategoriesPage.AddNewCategory")!}
                onsave={async () => await saveCategory()}
                oncancel={() => setEditCategoryStore("showDialog", false)}>

                {/* Name */}
                <TextInput
                    value={editCategoryStore.name}
                    placeholder={t("CategoriesPage.CategoryNamePlaceholder")}
                    oninput={(value) => setEditCategoryStore("name", value)} />

                {/* Color */}
                <ColorPicker
                    title="Select a color"
                    value={editCategoryStore.color}
                    onchange={(value) => setEditCategoryStore("color", value)} />
            </FormDialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                show={deleteCategoryStore.showDialog}
                title={t("CategoriesPage.DeleteCategoryTitle")!}
                message={t("CategoriesPage.DeleteCategoryMessage", deleteCategoryStore.category?.name ?? "")!}
                onconfirm={async () => await deleteCategory()}
                oncancel={() => setDeleteCategoryStore("showDialog", false)} />
        </Page>
    );
};

export default Categories;

const EmptyTemplate: Component = () => {
    const { t } = useI18n();

    return (
        <div class="bg-surface-200 text-surface-content rounded-surface h-24 items-center flex flex-row gap-sm justify-center">
            <p class="text-center text-xl">{t("CategoriesPage.YouHaveNoCategories")}</p>
            <FrownIcon />
        </div>
    );
};