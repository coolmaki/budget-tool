import { useBudgetContext, useCore } from "@/app/core";
import { useI18n } from "@/app/i18n";
import { useLogging } from "@/app/logging";
import { useNavigation } from "@/app/navigation";
import { convertPeriod } from "@/core/helpers";
import type { Account, Category, Expense } from "@/core/models";
import { PeriodType } from "@/core/types";
import ConfirmDialog from "@/ui/components/dialogs/ConfirmDialog";
import FormDialog from "@/ui/components/dialogs/FormDIalog";
import InformationDialog from "@/ui/components/dialogs/InformationDialog";
import Dropdown from "@/ui/components/form/Dropdown";
import NumberInput from "@/ui/components/form/NumberInput";
import TextInput from "@/ui/components/form/TextInput";
import List from "@/ui/components/List";
import ListHeader from "@/ui/components/ListHeader";
import PeriodPicker from "@/ui/components/PeriodPicker";
import Page from "@/ui/templates/Page";
import { ChevronLeft, DollarSignIcon, FrownIcon, InfoIcon, PenIcon, XIcon } from "lucide-solid";
import { createMemo, createSignal, type Component } from "solid-js";
import { createStore, unwrap } from "solid-js/store";

type ExpenseFilter = {
    search?: string;
    categoryId?: string;
    accountId?: string;
};

type ExpensesStore = {
    expenses: Expense[];
    loading: boolean;
};

type CategoriesStore = {
    categories: Category[];
    loading: boolean;
};

type AccountsStore = {
    accounts: Account[];
    loading: boolean;
};

type EditExpenseStore = {
    id: string | null;
    name: string;
    periodType: PeriodType;
    periodAmount: number;
    amount: number;
    categoryId: string;
    accountId: string;
    showDialog: boolean;
    executing: boolean;
};

type DeleteExpenseStore = {
    expense: Expense | null;
    showDialog: boolean;
    executing: boolean;
};

const Expenses: Component = () => {
    const { t } = useI18n();
    const core = useCore();
    const { pop } = useNavigation();
    const logger = useLogging();
    const [context, _] = useBudgetContext();

    const [showInfo, setShowInfo] = createSignal(false);

    const [filter, setFilter] = createStore<ExpenseFilter>({});

    const [expensesStore, setExpensesStore] = createStore<ExpensesStore>({
        expenses: [],
        loading: false,
    });

    const [categoriesStore, setCategoriesStore] = createStore<CategoriesStore>({
        categories: [],
        loading: false,
    });

    const [accountsStore, setAccountsStore] = createStore<AccountsStore>({
        accounts: [],
        loading: false,
    });

    const total = createMemo(() => expensesStore.expenses
        .map((expense) => convertPeriod({
            amount: expense.amount,
            currentPeriod: expense.period,
            targetPeriod: context.period,
        }))
        .reduce((total, amount) => total + amount, 0));

    const selectedCategory = createMemo(() => categoriesStore.categories.find((category) => category.id === editExpenseStore.categoryId));

    const selectedAccount = createMemo(() => accountsStore.accounts.find((account) => account.id === editExpenseStore.accountId));

    const [editExpenseStore, setEditExpenseStore] = createStore<EditExpenseStore>({
        id: null,
        name: "",
        periodType: PeriodType.WEEK,
        periodAmount: 1,
        amount: 0,
        categoryId: "",
        accountId: "",
        showDialog: false,
        executing: false,
    });

    const [deleteExpenseStore, setDeleteExpenseStore] = createStore<DeleteExpenseStore>({
        expense: null,
        showDialog: false,
        executing: false,
    });

    const isLoading = createMemo(() =>
        expensesStore.loading ||
        categoriesStore.loading ||
        accountsStore.loading ||
        editExpenseStore.executing ||
        deleteExpenseStore.executing);

    async function onAppearing(): Promise<void> {
        await Promise.all([
            loadExpenses(filter),
            loadCategories(),
            loadAccounts(),
        ]);
    }

    async function loadExpenses(filter: ExpenseFilter): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return;
        }

        setExpensesStore("loading", true);

        await core
            .getExpenses({
                budgetId: budgetId,
                search: filter.search,
                categoryId: filter.categoryId,
                accountId: filter.accountId,
            })
            .then((expenses) => setExpensesStore("expenses", expenses))
            .finally(() => {
                setExpensesStore("loading", false);
            });
    }

    async function loadCategories(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return;
        }

        setCategoriesStore("loading", true);

        await core
            .getCategories({ budgetId: budgetId, search: "" })
            .then((categories) => setCategoriesStore("categories", categories))
            .finally(() => {
                setCategoriesStore("loading", false);
            });
    }

    async function loadAccounts(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return;
        }

        setAccountsStore("loading", true);

        await core
            .getAccounts({ budgetId: budgetId, search: "" })
            .then((accounts) => setAccountsStore("accounts", accounts))
            .finally(() => {
                setAccountsStore("loading", false);
            });
    }

    function showEditDialog(e: MouseEvent, expense?: Expense): void {
        e.stopPropagation();

        setEditExpenseStore({
            id: expense?.id ?? null,
            name: expense?.name ?? "",
            periodType: expense?.period.type ?? PeriodType.WEEK,
            periodAmount: expense?.period.amount ?? 1,
            amount: expense?.amount ?? 0,
            categoryId: expense?.category.id ?? "",
            accountId: expense?.account.id ?? "",
            showDialog: true,
            executing: false,
        });
    }

    function saveExpense(): Promise<void> {
        return editExpenseStore.id
            ? editExpense()
            : createExpense();
    }

    function createExpense(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return Promise.resolve();
        }

        setEditExpenseStore("showDialog", false);
        return handleAction(() => core.createExpense({
            budgetId: budgetId,
            name: editExpenseStore.name,
            period: {
                type: editExpenseStore.periodType,
                amount: editExpenseStore.periodAmount,
            },
            amount: editExpenseStore.amount,
            categoryId: editExpenseStore.categoryId,
            accountId: editExpenseStore.accountId,
        }));
    }

    function editExpense(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return Promise.resolve();
        }

        setEditExpenseStore("showDialog", false);

        return handleAction(() => core.updateExpense({
            budgetId: budgetId,
            id: editExpenseStore.id!,
            name: editExpenseStore.name,
            period: {
                type: editExpenseStore.periodType,
                amount: editExpenseStore.periodAmount,
            },
            amount: editExpenseStore.amount,
            categoryId: editExpenseStore.categoryId,
            accountId: editExpenseStore.accountId,
        }));
    }

    function confirmDeleteExpense(e: MouseEvent, expense: Expense): void {
        e.stopPropagation();

        setDeleteExpenseStore({
            expense: expense,
            showDialog: true,
        });
    }

    function deleteExpense(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return Promise.resolve();
        }

        setDeleteExpenseStore("showDialog", false);
        return handleAction(() => core.deleteExpense({
            budgetId: budgetId,
            id: unwrap(deleteExpenseStore.expense!.id),
        }));
    }

    async function handleAction(action: () => Promise<void>): Promise<void> {
        await action()
            .then(() => loadExpenses(filter))
            .catch(error => {
                // TODO: handle error
                const message = t("Global.Errors.Unhandled");
                logger.error(message, error);
            });
    }

    const ExpenseTemplate: Component<{ item: Expense }> = (props) => {
        return (
            <div
                class="flex-col bg-surface-200 rounded-surface shadow-sm gap-xs border border-border pb-sm">

                {/* Row 1 */}
                <div class="flex flex-row items-center gap-xs min-h-[5.4rem] h-[5.4rem] pl-md pr-sm">
                    <div class="flex-1">
                        <p class="text-lg text-surface-content">{props.item.name}</p>
                        <span class="text-sm text-medium-emphasis">{props.item.category.name}</span>
                    </div>

                    <button
                        type="button"
                        class="button-icon-field shrink-0 bg-info text-error-content"
                        onclick={(e) => showEditDialog(e, props.item)}>
                        <PenIcon size={20} class="mx-auto" />
                    </button>

                    <button
                        type="button"
                        class="button-icon-field shrink-0 bg-error text-error-content rounded-none"
                        onclick={(e) => confirmDeleteExpense(e, props.item)}>
                        <XIcon size={20} class="mx-auto" />
                    </button>
                </div>

                {/* Row 2 */}
                <span class="flex flex-row gap-xs px-md items-center">
                    <span class="text-xl text-primary">
                        {t("Core.CurrencyFormat", convertPeriod({
                            amount: props.item.amount,
                            currentPeriod: props.item.period,
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
            title={t("ExpensesPage.Title")!}
            leadingIcon={ChevronLeft}
            leadingAction={async () => await pop()}
            trailingIcon={InfoIcon}
            trailingAction={() => setShowInfo(true)}
            onappearing={onAppearing}>

            <InformationDialog
                show={showInfo()}
                title={t("ExpensesPage.Title")!}
                text={t("ExpensesPage.Information")!}
                ondismiss={() => setShowInfo(false)} />

            <ListHeader
                searchPlaceholder={t("ExpensesPage.SearchExpenses")}
                onfilter={() => { }}
                onsearch={async (value) => {
                    setFilter("search", value);
                    await loadExpenses(filter);
                }}
                onadd={(e) => showEditDialog(e)} />

            <hr class="text-border" />

            {/* Content */}
            <main
                class="flex-1 flex flex-col min-h-0 p-sm gap-sm overflow-y-auto"
                classList={{ "justify-center": isLoading() }}>
                <List
                    loading={isLoading()}
                    items={expensesStore.expenses}
                    itemTemplate={ExpenseTemplate}
                    emptyTemplate={EmptyTemplate} />
            </main>

            <hr class="text-border" />

            <span class="flex flex-row justify-center items-center gap-xs p-sm">
                <span class="text-2xl text-surface-content">{t("Core.Total")}</span>
                <span class="text-3xl text-primary">{t("Core.CurrencyFormat", total())}</span>
            </span>

            {/* Create New Expense Dialog */}
            <FormDialog
                show={editExpenseStore.showDialog}
                title={editExpenseStore.id ? t("ExpensesPage.EditExpense")! : t("ExpensesPage.AddNewExpense")!}
                onsave={async () => await saveExpense()}
                oncancel={() => setEditExpenseStore("showDialog", false)}>

                {/* Name */}
                <TextInput
                    value={editExpenseStore.name}
                    placeholder={t("ExpensesPage.ExpenseNamePlaceholder")}
                    oninput={(value) => setEditExpenseStore("name", value)} />

                {/* Amount */}
                <NumberInput
                    value={editExpenseStore.amount}
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    fractionDigits={2}
                    state={isNaN(editExpenseStore.amount) ? "invalid" : "none"}
                    leadingIcon={DollarSignIcon}
                    onblur={(value) => setEditExpenseStore("amount", value)} />

                {/* Period */}
                <PeriodPicker
                    value={{ amount: editExpenseStore.periodAmount, type: editExpenseStore.periodType }}
                    onamountchanged={(amount) => setEditExpenseStore("periodAmount", amount)}
                    ontypechanged={(type) => setEditExpenseStore("periodType", type)} />

                {/* Category */}
                <Dropdown
                    items={categoriesStore.categories}
                    title={t("ExpensesPage.SelectCategory")}
                    value={selectedCategory()}
                    getName={(value) => value?.name ?? t("ExpensesPage.SelectCategory")!}
                    areEqual={(a, b) => a?.id === b?.id}
                    onselected={(value) => setEditExpenseStore("categoryId", value.id)} />

                {/* Account */}
                <Dropdown
                    items={accountsStore.accounts}
                    title={t("ExpensesPage.SelectAccount")}
                    value={selectedAccount()}
                    getName={(value) => value?.name ?? t("ExpensesPage.SelectAccount")!}
                    areEqual={(a, b) => a?.id === b?.id}
                    onselected={(value) => setEditExpenseStore("accountId", value.id)} />
            </FormDialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                show={deleteExpenseStore.showDialog}
                title={t("ExpensesPage.DeleteExpenseTitle")!}
                message={t("ExpensesPage.DeleteExpenseMessage", deleteExpenseStore.expense?.name ?? "")!}
                onconfirm={async () => await deleteExpense()}
                oncancel={() => setDeleteExpenseStore("showDialog", false)} />
        </Page>
    );
};

export default Expenses;

const EmptyTemplate: Component = () => {
    const { t } = useI18n();

    return (
        <div class="bg-surface-200 text-surface-content rounded-surface h-24 items-center flex flex-row gap-sm justify-center">
            <p class="text-center text-xl">{t("ExpensesPage.YouHaveNoExpenses")}</p>
            <FrownIcon />
        </div>
    );
};