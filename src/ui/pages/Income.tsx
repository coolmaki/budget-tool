import { useBudgetContext, useCore } from "@/app/core";
import { useI18n } from "@/app/i18n";
import { useLogging } from "@/app/logging";
import { useNavigation } from "@/app/navigation";
import { convertPeriod } from "@/core/helpers";
import type { Income } from "@/core/models";
import { PeriodType } from "@/core/types";
import ConfirmDialog from "@/ui/components/dialogs/ConfirmDialog";
import FormDialog from "@/ui/components/dialogs/FormDialog";
import InformationDialog from "@/ui/components/dialogs/InformationDialog";
import NumberInput from "@/ui/components/form/NumberInput";
import TextInput from "@/ui/components/form/TextInput";
import List from "@/ui/components/List";
import ListHeader from "@/ui/components/ListHeader";
import PeriodPicker from "@/ui/components/PeriodPicker";
import Page from "@/ui/templates/Page";
import { ChevronLeft, DollarSignIcon, FrownIcon, InfoIcon, PenIcon, XIcon } from "lucide-solid";
import { createMemo, createSignal, type Component } from "solid-js";
import { createStore, unwrap } from "solid-js/store";

type IncomeStore = {
    incomes: Income[];
    loading: boolean;
}

type EditIncomeStore = {
    id: string | null;
    name: string;
    periodType: PeriodType;
    periodAmount: number;
    amount: number;
    showDialog: boolean;
    executing: boolean;
};

type DeleteIncomeStore = {
    income: Income | null;
    showDialog: boolean;
    executing: boolean;
};

const Income: Component = () => {
    const { t } = useI18n();
    const core = useCore();
    const { pop } = useNavigation();
    const logger = useLogging();
    const [context, _] = useBudgetContext();

    const [showInfo, setShowInfo] = createSignal(false);

    const [searchValue, setSearchValue] = createSignal("");

    const [incomeStore, setIncomeStore] = createStore<IncomeStore>({
        incomes: [],
        loading: false,
    });

    const total = createMemo(() => incomeStore.incomes
        .map((income) => convertPeriod({
            amount: income.amount,
            currentPeriod: income.period,
            targetPeriod: context.period,
        }))
        .reduce((total, amount) => total + amount, 0));

    const [editIncomeStore, setEditIncomeStore] = createStore<EditIncomeStore>({
        id: null,
        name: "",
        periodType: PeriodType.WEEK,
        periodAmount: 1,
        amount: 0,
        showDialog: false,
        executing: false,
    });

    const [deleteIncomeStore, setDeleteIncomeStore] = createStore<DeleteIncomeStore>({
        income: null,
        showDialog: false,
        executing: false,
    });

    const isLoading = createMemo(() =>
        incomeStore.loading ||
        editIncomeStore.executing ||
        deleteIncomeStore.executing);

    async function onAppearing(): Promise<void> {
        await loadIncomes(searchValue());
    }

    async function loadIncomes(search: string): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return;
        }

        setIncomeStore("loading", true);

        await core
            .getIncomes({
                budgetId: budgetId,
                search: search,
            })
            .then((incomes) => setIncomeStore("incomes", incomes))
            .finally(() => {
                setIncomeStore("loading", false);
            });
    }

    function showEditDialog(e: MouseEvent, income?: Income): void {
        e.stopPropagation();

        setEditIncomeStore({
            id: income?.id ?? null,
            name: income?.name ?? "",
            periodType: income?.period.type ?? PeriodType.WEEK,
            periodAmount: income?.period.amount ?? 1,
            amount: income?.amount ?? 0,
            showDialog: true,
            executing: false,
        });
    }

    function saveIncome(): Promise<void> {
        return editIncomeStore.id
            ? editIncome()
            : createIncome();
    }

    function createIncome(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return Promise.resolve();
        }

        setEditIncomeStore("showDialog", false);
        return handleAction(() => core.createIncome({
            budgetId: budgetId,
            name: editIncomeStore.name,
            period: {
                type: editIncomeStore.periodType,
                amount: editIncomeStore.periodAmount,
            },
            amount: editIncomeStore.amount,
        }));
    }

    function editIncome(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return Promise.resolve();
        }

        setEditIncomeStore("showDialog", false);

        return handleAction(() => core.updateIncome({
            budgetId: budgetId,
            id: editIncomeStore.id!,
            name: editIncomeStore.name,
            period: {
                type: editIncomeStore.periodType,
                amount: editIncomeStore.periodAmount,
            },
            amount: editIncomeStore.amount,
        }));
    }

    function confirmDeleteIncome(e: MouseEvent, income: Income): void {
        e.stopPropagation();

        setDeleteIncomeStore({
            income: income,
            showDialog: true,
        });
    }

    function deleteIncome(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return Promise.resolve();
        }

        setDeleteIncomeStore("showDialog", false);
        return handleAction(() => core.deleteIncome({
            budgetId: budgetId,
            id: unwrap(deleteIncomeStore.income!.id),
        }));
    }

    async function handleAction(action: () => Promise<void>): Promise<void> {
        await action()
            .then(() => loadIncomes(searchValue()))
            .catch(error => {
                // TODO: handle error
                const message = t("Global.Errors.Unhandled");
                logger.error(message, error);
            });
    }

    const IncomeTemplate: Component<{ item: Income }> = (props) => {
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
                        onclick={(e) => confirmDeleteIncome(e, props.item)}>
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
            title={t("IncomePage.Title")!}
            leadingIcon={ChevronLeft}
            leadingAction={async () => await pop()}
            trailingIcon={InfoIcon}
            trailingAction={() => setShowInfo(true)}
            onappearing={onAppearing}>

            <InformationDialog
                show={showInfo()}
                title={t("IncomePage.Title")!}
                text={t("IncomePage.Information")!}
                ondismiss={() => setShowInfo(false)} />

            <ListHeader
                searchPlaceholder={t("IncomePage.SearchIncomes")}
                onsearch={async (value) => {
                    setSearchValue(value);
                    await loadIncomes(value);
                }}
                onadd={(e) => showEditDialog(e)} />

            <hr class="text-border" />

            {/* Content */}
            <main
                class="flex-1 flex flex-col min-h-0 p-sm gap-sm overflow-y-auto"
                classList={{ "justify-center": isLoading() }}>
                <List
                    loading={isLoading()}
                    items={incomeStore.incomes}
                    itemTemplate={IncomeTemplate}
                    emptyTemplate={EmptyTemplate} />
            </main>

            <hr class="text-border" />

            <span class="flex flex-row justify-center items-center gap-xs p-sm">
                <span class="text-2xl text-surface-content">{t("Core.Total")}</span>
                <span class="text-3xl text-primary">{t("Core.CurrencyFormat", total())}</span>
            </span>

            {/* Create New Income Dialog */}
            <FormDialog
                show={editIncomeStore.showDialog}
                title={editIncomeStore.id ? t("IncomePage.EditIncome")! : t("IncomePage.AddNewIncome")!}
                onsave={async () => await saveIncome()}
                oncancel={() => setEditIncomeStore("showDialog", false)}>

                {/* Name */}
                <TextInput
                    value={editIncomeStore.name}
                    placeholder={t("IncomePage.IncomeNamePlaceholder")}
                    oninput={(value) => setEditIncomeStore("name", value)} />

                {/* Amount */}
                <NumberInput
                    value={editIncomeStore.amount}
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    fractionDigits={2}
                    state={isNaN(editIncomeStore.amount) ? "invalid" : "none"}
                    leadingIcon={DollarSignIcon}
                    onblur={(value) => setEditIncomeStore("amount", value)} />

                {/* Period */}
                <PeriodPicker
                    value={{ amount: editIncomeStore.periodAmount, type: editIncomeStore.periodType }}
                    onamountchanged={(amount) => setEditIncomeStore("periodAmount", amount)}
                    ontypechanged={(type) => setEditIncomeStore("periodType", type)} />
            </FormDialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                show={deleteIncomeStore.showDialog}
                title={t("IncomePage.DeleteIncomeTitle")!}
                message={t("IncomePage.DeleteIncomeMessage", deleteIncomeStore.income?.name ?? "")!}
                onconfirm={async () => await deleteIncome()}
                oncancel={() => setDeleteIncomeStore("showDialog", false)} />
        </Page>
    );
};

export default Income;

const EmptyTemplate: Component = () => {
    const { t } = useI18n();

    return (
        <div class="bg-surface-200 text-surface-content rounded-surface h-24 items-center flex flex-row gap-sm justify-center">
            <p class="text-center text-xl">{t("IncomePage.YouHaveNoIncome")}</p>
            <FrownIcon />
        </div>
    );
};