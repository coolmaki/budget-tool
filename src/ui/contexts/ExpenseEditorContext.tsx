import { useBudgetContext, useCore } from "@/app/core";
import { useI18n } from "@/app/i18n";
import type { Account, Category, Expense } from "@/core/models";
import { PeriodType } from "@/core/types";
import ConfirmDialog from "@/ui/components/dialogs/ConfirmDialog";
import FormDialog from "@/ui/components/dialogs/FormDIalog";
import Dropdown from "@/ui/components/form/Dropdown";
import NumberInput from "@/ui/components/form/NumberInput";
import TextInput from "@/ui/components/form/TextInput";
import PeriodPicker from "@/ui/components/PeriodPicker";
import { AccountNotSetError, BudgetNotSetError, CategoryNotSetError } from "@/ui/errors";
import { DollarSignIcon } from "lucide-solid";
import { createContext, createMemo, ParentComponent, useContext } from "solid-js";
import { createStore, unwrap } from "solid-js/store";

type EditExpenseStore = {
    categories: Category[];
    accounts: Account[];
    id: string | null;
    name: string;
    periodType: PeriodType;
    periodAmount: number;
    amount: number;
    categoryId?: string;
    accountId?: string;
    showDialog: boolean;
    executing: boolean;
};

type DeleteExpenseStore = {
    expense: Expense | null;
    showDialog: boolean;
    executing: boolean;
};

type CreateExpenseContext = {
    categories: Category[];
    accounts: Account[];
}

type UpdateExpenseContext = {
    expense: Expense;
    categories: Category[];
    accounts: Account[];
}

type DeleteExpenseContext = {
    expense: Expense;
}

type ActionResolver = {
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (reason?: any) => void;
};

type ExpenseEditorContext = {
    createExpense(actionContext: CreateExpenseContext): Promise<void>;
    updateExpense(actionContext: UpdateExpenseContext): Promise<void>;
    deleteExpense(actionContext: DeleteExpenseContext): Promise<void>;
};

const ExpenseEditorContext = createContext<ExpenseEditorContext>();

export const ExpenseEditorContextProvider: ParentComponent = (props) => {
    const { t } = useI18n();
    const core = useCore();
    const [context, _] = useBudgetContext();

    let actionResolver: ActionResolver | null = null;

    const [editExpenseStore, setEditExpenseStore] = createStore<EditExpenseStore>({
        categories: [],
        accounts: [],
        id: null,
        name: "",
        periodType: PeriodType.WEEK,
        periodAmount: 1,
        amount: 0,
        categoryId: undefined,
        accountId: undefined,
        showDialog: false,
        executing: false,
    });

    const [deleteExpenseStore, setDeleteExpenseStore] = createStore<DeleteExpenseStore>({
        expense: null,
        showDialog: false,
        executing: false,
    });

    const selectedCategory = createMemo(() => editExpenseStore.categories.find((category) => category.id === editExpenseStore.categoryId));

    const selectedAccount = createMemo(() => editExpenseStore.accounts.find((account) => account.id === editExpenseStore.accountId));

    function assertBudgetIdSet(): string {
        const budgetId = context.id;
        if (!budgetId) { throw new BudgetNotSetError(); }
        return budgetId;
    }

    function assertCategoryIdSet(): string {
        const categoryId = editExpenseStore.categoryId;
        if (!categoryId) { throw new CategoryNotSetError(); }
        return categoryId;
    }

    function assertAccountIdSet(): string {
        const accountId = editExpenseStore.accountId;
        if (!accountId) { throw new AccountNotSetError(); }
        return accountId;
    }

    function create(actionContext: CreateExpenseContext): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            actionResolver = { resolve, reject };
            setEditExpenseStore({
                categories: actionContext.categories,
                accounts: actionContext.accounts,
                id: null,
                name: "",
                periodType: PeriodType.WEEK,
                periodAmount: 1,
                amount: 0,
                categoryId: undefined,
                accountId: undefined,
                showDialog: true,
                executing: false,
            });
        });
    }

    function saveCreate(): Promise<void> {
        const budgetId = assertBudgetIdSet();
        const categoryId = assertCategoryIdSet();
        const accountId = assertAccountIdSet();

        setEditExpenseStore("showDialog", false);

        return core
            .createExpense({
                budgetId: budgetId,
                name: editExpenseStore.name,
                period: {
                    type: editExpenseStore.periodType,
                    amount: editExpenseStore.periodAmount,
                },
                amount: editExpenseStore.amount,
                categoryId: categoryId,
                accountId: accountId,
            })
            .finally(() => {
                actionResolver!.resolve();
                actionResolver = null;
            });
    }

    function cancelCreate(): void {
        setEditExpenseStore("showDialog", false);
        actionResolver!.resolve();
        actionResolver = null;
    }

    function update(actionContext: UpdateExpenseContext): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            actionResolver = { resolve, reject };
            setEditExpenseStore({
                categories: actionContext.categories,
                accounts: actionContext.accounts,
                id: actionContext.expense?.id ?? null,
                name: actionContext.expense?.name ?? "",
                periodType: actionContext.expense?.period.type ?? PeriodType.WEEK,
                periodAmount: actionContext.expense?.period.amount ?? 1,
                amount: actionContext.expense?.amount ?? 0,
                categoryId: actionContext.expense?.category.id,
                accountId: actionContext.expense?.account.id,
                showDialog: true,
                executing: false,
            });
        });
    }

    function saveUpdate(): Promise<void> {
        const budgetId = assertBudgetIdSet();
        const categoryId = assertCategoryIdSet();
        const accountId = assertAccountIdSet();

        setEditExpenseStore("showDialog", false);

        return core
            .updateExpense({
                budgetId: budgetId,
                id: editExpenseStore.id!,
                name: editExpenseStore.name,
                period: {
                    type: editExpenseStore.periodType,
                    amount: editExpenseStore.periodAmount,
                },
                amount: editExpenseStore.amount,
                categoryId: categoryId,
                accountId: accountId,
            })
            .finally(() => {
                actionResolver!.resolve();
                actionResolver = null;
            });
    }

    function cancelUpdate(): void {
        setEditExpenseStore("showDialog", false);
        actionResolver!.resolve();
        actionResolver = null;
    }

    function deleteExpense(actionContext: DeleteExpenseContext): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            actionResolver = { resolve, reject };
            setDeleteExpenseStore({
                expense: actionContext.expense,
                showDialog: true,
                executing: false,
            });
        });
    }

    function saveDelete(): Promise<void> {
        const budgetId = assertBudgetIdSet();

        setDeleteExpenseStore("showDialog", false);

        return core
            .deleteExpense({
                budgetId: budgetId,
                id: unwrap(deleteExpenseStore.expense!.id),
            })
            .finally(() => {
                actionResolver!.resolve();
                actionResolver = null;
            });
    }

    function cancelDelete(): void {
        setDeleteExpenseStore("showDialog", false);
        actionResolver!.resolve();
        actionResolver = null;
    }

    return (
        <ExpenseEditorContext.Provider value={{
            createExpense: create,
            updateExpense: update,
            deleteExpense: deleteExpense
        }}>
            {props.children}
            {/* Create New Expense Dialog */}
            <FormDialog
                show={editExpenseStore.showDialog}
                title={editExpenseStore.id ? t("ExpensesPage.EditExpense")! : t("ExpensesPage.AddNewExpense")!}
                onsave={editExpenseStore.id ? saveUpdate : saveCreate}
                oncancel={editExpenseStore.id ? cancelUpdate : cancelCreate}>

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
                    items={editExpenseStore.categories}
                    title={t("ExpensesPage.SelectCategory")}
                    value={selectedCategory()}
                    getName={(value) => value?.name ?? t("ExpensesPage.SelectCategory")!}
                    areEqual={(a, b) => a?.id === b?.id}
                    onselected={(value) => setEditExpenseStore("categoryId", value.id)} />

                {/* Account */}
                <Dropdown
                    items={editExpenseStore.accounts}
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
                onconfirm={saveDelete}
                oncancel={cancelDelete} />
        </ExpenseEditorContext.Provider>
    );
}

export function useExpenseEditor(): ExpenseEditorContext {
    const context = useContext(ExpenseEditorContext);
    return context!;
}
