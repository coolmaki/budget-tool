import { useBudgetContext, useCore } from "@/app/core";
import { useI18n } from "@/app/i18n";
import { useLogging } from "@/app/logging";
import { useNavigation } from "@/app/navigation";
import { convertPeriod } from "@/core/helpers";
import type { Account } from "@/core/models";
import { PeriodType } from "@/core/types";
import ConfirmDialog from "@/ui/components/dialogs/ConfirmDialog";
import FormDialog from "@/ui/components/dialogs/FormDIalog";
import InformationDialog from "@/ui/components/dialogs/InformationDialog";
import TextInput from "@/ui/components/form/TextInput";
import List from "@/ui/components/List";
import ListHeader from "@/ui/components/ListHeader";
import { useExpenseFilter } from "@/ui/contexts/ExpenseFilterContext";
import Expenses from "@/ui/pages/Expenses";
import Page from "@/ui/templates/Page";
import { ChevronLeft, FrownIcon, InfoIcon, PenIcon, XIcon } from "lucide-solid";
import { createMemo, createSignal, type Component } from "solid-js";
import { createStore, unwrap } from "solid-js/store";

type AccountsStore = {
    accounts: Account[];
    loading: boolean;
}

type EditAccountStore = {
    id: string | null;
    name: string;
    showDialog: boolean;
    executing: boolean;
};

type DeleteAccountStore = {
    account: Account | null;
    showDialog: boolean;
    executing: boolean;
};

const Accounts: Component = () => {
    const { t } = useI18n();
    const core = useCore();
    const { pop, push } = useNavigation();
    const logger = useLogging();
    const [context,] = useBudgetContext();
    const [, setFilter] = useExpenseFilter();

    const [showInfo, setShowInfo] = createSignal(false);

    const [searchValue, setSearchValue] = createSignal("");

    const [accountStore, setAccountStore] = createStore<AccountsStore>({
        accounts: [],
        loading: false,
    });

    const [editAccountStore, setEditAccountStore] = createStore<EditAccountStore>({
        id: null,
        name: "",
        showDialog: false,
        executing: false,
    });

    const [deleteAccountStore, setDeleteAccountStore] = createStore<DeleteAccountStore>({
        account: null,
        showDialog: false,
        executing: false,
    });

    const isLoading = createMemo(() =>
        accountStore.loading ||
        editAccountStore.executing ||
        deleteAccountStore.executing);

    async function onAppearing(): Promise<void> {
        await loadAccounts(searchValue());
    }

    async function loadAccounts(search: string): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return;
        }

        setAccountStore("loading", true);

        await core
            .getAccounts({
                budgetId: budgetId,
                search: search,
            })
            .then((account) => setAccountStore("accounts", account))
            .finally(() => {
                setAccountStore("loading", false);
            });
    }

    function showEditDialog(e: MouseEvent, account?: Account): void {
        e.stopPropagation();

        setEditAccountStore({
            id: account?.id ?? null,
            name: account?.name ?? "",
            showDialog: true,
            executing: false,
        });
    }

    function saveAccount(): Promise<void> {
        return editAccountStore.id
            ? editAccount()
            : createAccount();
    }

    function createAccount(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return Promise.resolve();
        }

        setEditAccountStore("showDialog", false);
        return handleAction(() => core.createAccount({
            budgetId: budgetId,
            name: editAccountStore.name,
        }));
    }

    function editAccount(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return Promise.resolve();
        }

        setEditAccountStore("showDialog", false);

        return handleAction(() => core.updateAccount({
            budgetId: budgetId,
            id: editAccountStore.id!,
            name: editAccountStore.name,
        }));
    }

    function confirmDeleteAccount(e: MouseEvent, account: Account): void {
        e.stopPropagation();

        setDeleteAccountStore({
            account: account,
            showDialog: true,
        });
    }

    function deleteAccount(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return Promise.resolve();
        }

        setDeleteAccountStore("showDialog", false);
        return handleAction(() => core.deleteAccount({
            budgetId: budgetId,
            id: unwrap(deleteAccountStore.account!.id),
        }));
    }

    function selectAccount(account: Account): Promise<void> {
        setFilter({ account: unwrap(account) });
        return push(Expenses);
    }

    async function handleAction(action: () => Promise<void>): Promise<void> {
        await action()
            .then(() => loadAccounts(searchValue()))
            .catch(error => {
                // TODO: handle error
                const message = t("Global.Errors.Unhandled");
                logger.error(message, error);
            });
    }

    const AccountTemplate: Component<{ item: Account }> = (props) => {
        return (
            <div
                class="flex-col bg-surface-200 rounded-surface shadow-sm gap-xs border border-border pb-sm"
                onclick={async () => await selectAccount(props.item)}>

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
                        onclick={(e) => confirmDeleteAccount(e, props.item)}>
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
            title={t("AccountsPage.Title")!}
            leadingIcon={ChevronLeft}
            leadingAction={async () => await pop()}
            trailingIcon={InfoIcon}
            trailingAction={() => setShowInfo(true)}
            onappearing={onAppearing}>

            <InformationDialog
                show={showInfo()}
                title={t("AccountsPage.Title")!}
                text={t("AccountsPage.Information")!}
                ondismiss={() => setShowInfo(false)} />

            <ListHeader
                searchPlaceholder={t("AccountsPage.SearchAccounts")}
                onsearch={async (value) => {
                    setSearchValue(value);
                    await loadAccounts(value);
                }}
                onadd={(e) => showEditDialog(e)} />

            <hr class="text-border" />

            {/* Content */}
            <main
                class="flex-1 flex flex-col min-h-0 p-sm gap-sm overflow-y-auto"
                classList={{ "justify-center": isLoading() }}>
                <List
                    loading={isLoading()}
                    items={accountStore.accounts}
                    itemTemplate={AccountTemplate}
                    emptyTemplate={EmptyTemplate} />
            </main>

            {/* Create New Account Dialog */}
            <FormDialog
                show={editAccountStore.showDialog}
                title={editAccountStore.id ? t("AccountsPage.EditAccount")! : t("AccountsPage.AddNewAccount")!}
                onsave={async () => await saveAccount()}
                oncancel={() => setEditAccountStore("showDialog", false)}>

                {/* Name */}
                <TextInput
                    value={editAccountStore.name}
                    placeholder={t("AccountsPage.AccountNamePlaceholder")}
                    oninput={(value) => setEditAccountStore("name", value)} />
            </FormDialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                show={deleteAccountStore.showDialog}
                title={t("AccountsPage.DeleteAccountTitle")!}
                message={t("AccountsPage.DeleteAccountMessage", deleteAccountStore.account?.name ?? "")!}
                onconfirm={async () => await deleteAccount()}
                oncancel={() => setDeleteAccountStore("showDialog", false)} />
        </Page>
    );
};

export default Accounts;

const EmptyTemplate: Component = () => {
    const { t } = useI18n();

    return (
        <div class="bg-surface-200 text-surface-content rounded-surface h-24 items-center flex flex-row gap-sm justify-center">
            <p class="text-center text-xl">{t("AccountsPage.YouHaveNoAccounts")}</p>
            <FrownIcon />
        </div>
    );
};