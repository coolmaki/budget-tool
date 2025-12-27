import { useBudgetContext, useCore } from "@/app/core";
import { useI18n } from "@/app/i18n";
import { useLogging } from "@/app/logging";
import { useNavigation } from "@/app/navigation";
import { Budget } from "@/core/models";
import ConfirmDialog from "@/ui/components/dialogs/ConfirmDialog";
import FormDialog from "@/ui/components/dialogs/FormDialog";
import TextInput from "@/ui/components/form/TextInput";
import List from "@/ui/components/List";
import ListHeader from "@/ui/components/ListHeader";
import Manage from "@/ui/pages/Manage";
import Settings from "@/ui/pages/Settings";
import Page from "@/ui/templates/Page";
import { FrownIcon, PenIcon, SettingsIcon, XIcon } from "lucide-solid";
import { Component, createMemo, createSignal } from "solid-js";
import { createStore, unwrap } from "solid-js/store";

type BudgetStore = {
    budgets: Budget[];
    loading: boolean;
}

type EditBudgetStore = {
    id: string | null;
    name: string;
    showDialog: boolean;
    executing: boolean;
};

type DeleteBudgetStore = {
    budget: Budget | null;
    showDialog: boolean;
    executing: boolean;
};

const Budgets: Component = () => {
    const { t } = useI18n();
    const core = useCore();
    const { push } = useNavigation();
    const logger = useLogging();
    const [_, setContext] = useBudgetContext();

    const [searchValue, setSearchValue] = createSignal("");

    const [budgetStore, setBudgetStore] = createStore<BudgetStore>({
        budgets: [],
        loading: false,
    });

    const [editBudgetStore, setEditBudgetStore] = createStore<EditBudgetStore>({
        id: null,
        name: "",
        showDialog: false,
        executing: false,
    });

    const [deleteBudgetStore, setDeleteBudgetStore] = createStore<DeleteBudgetStore>({
        budget: null,
        showDialog: false,
        executing: false,
    });

    const isLoading = createMemo(() =>
        budgetStore.loading ||
        editBudgetStore.executing ||
        deleteBudgetStore.executing);

    async function onAppearing(): Promise<void> {
        await loadBudgets(searchValue());
    }

    async function loadBudgets(search: string): Promise<void> {
        setBudgetStore("loading", true);

        await core
            .getBudgets({ search })
            .then((budgets) => setBudgetStore("budgets", budgets))
            .finally(() => {
                setBudgetStore("loading", false);
            });
    }

    function showEditDialog(e: MouseEvent, budget?: Budget): void {
        e.stopPropagation();

        setEditBudgetStore({
            id: budget?.id ?? null,
            name: budget?.name ?? "",
            showDialog: true,
            executing: false,
        });
    }

    function saveBudget(): Promise<void> {
        return editBudgetStore.id
            ? editBudget()
            : createBudget();
    }

    function createBudget(): Promise<void> {
        setEditBudgetStore("showDialog", false);
        return handleAction(() => core.createBudget({ name: editBudgetStore.name }));
    }

    function editBudget(): Promise<void> {
        setEditBudgetStore("showDialog", false);

        const budget: Budget = {
            id: editBudgetStore.id!,
            name: editBudgetStore.name,
        };

        return handleAction(() => core.updateBudget({ budget }));
    }

    function confirmDeleteBudget(e: MouseEvent, budget: Budget): void {
        e.stopPropagation();

        setDeleteBudgetStore({
            budget: budget,
            showDialog: true,
        });
    }

    function deleteBudget(): Promise<void> {
        setDeleteBudgetStore("showDialog", false);
        return handleAction(() => core.deleteBudget({ budget: unwrap(deleteBudgetStore.budget)! }));
    }

    async function handleAction(action: () => Promise<void>): Promise<void> {
        await action()
            .then(() => loadBudgets(searchValue()))
            .catch(error => {
                // TODO: handle error
                const message = t("Global.Errors.Unhandled");
                logger.error(message, error);
            });
    }

    function selectBudget(id: string): Promise<void> {
        setContext("id", id);
        return push(Manage);
    }

    const BudgetTemplate: Component<{ item: Budget }> = (props) => {
        return (
            <div
                class="bg-surface-200 flex flex-row items-center rounded-surface shadow-sm gap-xs border border-border min-h-[5.4rem] h-[5.4rem] pl-md pr-sm"
                onclick={async () => await selectBudget(props.item.id)}>
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
                    onclick={(e) => confirmDeleteBudget(e, props.item)}>
                    <XIcon size={20} class="mx-auto" />
                </button>
            </div>
        );
    };

    return (
        <Page
            title={t("AppName")!}
            trailingIcon={SettingsIcon}
            trailingAction={async () => await push(Settings)}
            onappearing={onAppearing}>

            <ListHeader
                searchPlaceholder={t("BudgetsPage.SearchBudget")}
                onsearch={async (value) => {
                    setSearchValue(value);
                    await loadBudgets(value);
                }}
                onadd={(e) => showEditDialog(e)} />

            <hr class="text-border" />

            {/* Content */}
            <main
                class="flex-1 flex flex-col min-h-0 p-sm gap-sm overflow-y-auto"
                classList={{ "justify-center": isLoading() }}>
                <List
                    loading={isLoading()}
                    items={budgetStore.budgets}
                    itemTemplate={BudgetTemplate}
                    emptyTemplate={EmptyTemplate} />
            </main>

            {/* Create New Budget Dialog */}
            <FormDialog
                show={editBudgetStore.showDialog}
                title={editBudgetStore.id ? t("BudgetsPage.EditBudget")! : t("BudgetsPage.AddNewBudget")!}
                onsave={async () => await saveBudget()}
                oncancel={() => setEditBudgetStore("showDialog", false)}>
                <TextInput
                    value={editBudgetStore.name}
                    placeholder={t("BudgetsPage.BudgetNamePlaceholder")}
                    oninput={(value) => setEditBudgetStore("name", value)} />
            </FormDialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                show={deleteBudgetStore.showDialog}
                title={t("BudgetsPage.DeleteBudgetTitle")!}
                message={t("BudgetsPage.DeleteBudgetMessage", deleteBudgetStore.budget?.name ?? "")!}
                onconfirm={async () => await deleteBudget()}
                oncancel={() => setDeleteBudgetStore("showDialog", false)} />
        </Page>
    );
};

export default Budgets;

const EmptyTemplate: Component = () => {
    const { t } = useI18n();

    return (
        <div class="bg-surface-200 text-surface-content rounded-surface h-24 items-center flex flex-row gap-sm justify-center">
            <p class="text-center text-xl">{t("BudgetsPage.YouHaveNoBudgets")}</p>
            <FrownIcon />
        </div>
    );
};