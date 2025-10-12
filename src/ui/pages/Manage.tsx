import { useBudgetContext, useCore } from "@/app/core";
import { useI18n } from "@/app/i18n";
import { useNavigation } from "@/app/navigation";
import { Theme, useTheme } from "@/app/themes";
import { convertPeriod } from "@/core/helpers";
import { Category } from "@/core/models";
import { Period, PeriodType } from "@/core/types";
import FormDialog from "@/ui/components/dialogs/FormDIalog";
import InformationDialog from "@/ui/components/dialogs/InformationDialog";
import Dropdown from "@/ui/components/form/Dropdown";
import LoadingIndicator from "@/ui/components/LoadingIndicator";
import PeriodPicker from "@/ui/components/PeriodPicker";
import { useExpenseFilter } from "@/ui/contexts/ExpenseFilterContext";
import Accounts from "@/ui/pages/Accounts";
import Categories from "@/ui/pages/Categories";
import Expenses from "@/ui/pages/Expenses";
import Income from "@/ui/pages/Income";
import Page from "@/ui/templates/Page";
import { ArcElement, Chart, DoughnutController, type ChartConfiguration } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { CircleDollarSignIcon, EyeIcon, FrownIcon, HandCoinsIcon, InfoIcon, LucideIcon, PiggyBankIcon, ShapesIcon, XIcon } from "lucide-solid";
import { createEffect, createMemo, createSignal, Match, onCleanup, Switch, type Component } from "solid-js";
import { createStore } from "solid-js/store";

type DataStore = {
    totalIncome: number;
    totalIncomeLoading: boolean;
    categories: Category[];
    categoriesLoading: boolean;
    debugLoading: boolean;
};

type ChartDataItem = {
    label: string;
    value: number;
    color: string;
};

function getChartConfig(data: {
    income: number,
    categories: Category[],
    viewType: DataViewType,
    period: Period,
    theme: Theme,
    currencyFormat: (amount: number) => string
}): ChartConfiguration {

    function getValue(category: Category): number {
        switch (data.viewType) {
            case "dollar": return convertPeriod({
                amount: category.total,
                currentPeriod: { amount: 1, type: PeriodType.YEAR },
                targetPeriod: data.period,
            });
            case "percentage": return Math.round((category.total / data.income) * 100);
            default: throw new Error(`Invalid DataView Type "${data.viewType}"`);
        }
    }

    function formatValue(value: any): string {
        switch (data.viewType) {
            case "dollar": return data.currencyFormat(Number(value))!;
            case "percentage": return value + "%";
            default: throw new Error(`Invalid DataView Type "${data.viewType}"`);
        }
    }

    const chartData: ChartDataItem[] = data.categories
        .filter((category) => category.total > 0)
        .map((category) => ({
            label: category.name,
            value: getValue(category),
            color: category.color
        }));

    const periodIncome = convertPeriod({
        amount: data.income,
        currentPeriod: { amount: 1, type: PeriodType.YEAR },
        targetPeriod: data.period,
    });

    function getRemainingValue(): number {
        switch (data.viewType) {
            case "dollar": return periodIncome - chartData.reduce((total, current) => total + current.value, 0);
            case "percentage": return 100 - chartData.reduce((total, current) => total + current.value, 0);
            default: throw new Error(`Invalid DataView Type "${data.viewType}"`);
        }
    }

    const remainingIncome: ChartDataItem = {
        label: "Remaining",
        value: getRemainingValue(),
        color: data.theme === "dark" ? "#929292" : "#A0A0A0",
    };

    chartData.push(remainingIncome);

    return {
        type: "doughnut",
        data: {
            labels: chartData.map((item) => item.label),
            datasets: [
                {
                    data: chartData.map((data) => data.value),
                    backgroundColor: chartData.map((data) => data.color),
                    borderWidth: 0,
                },
            ],
        },
        options: {
            plugins: {
                datalabels: {
                    anchor: "center",
                    align: "center",
                    color: data.theme === "dark" ? "#000000" : "#FFFFFF",
                    backgroundColor: data.theme === "dark" ? "#FFFFFF" : "#000000",
                    borderRadius: 4,
                    font: {
                        weight: "bold",
                        size: 12,
                    },
                    formatter: (value, context) => chartData[context.dataIndex].label + " " + formatValue(value),
                },
            },
        },
        plugins: [ChartDataLabels],
    };
}

type DataViewType = "dollar" | "percentage";

type ViewState = {
    showViewOptions: boolean;
    dataViewType: DataViewType;
}

const Manage: Component = () => {
    const { t } = useI18n();
    const { pop, push } = useNavigation();
    const { theme } = useTheme();
    const core = useCore();
    const [context, setContext] = useBudgetContext();
    const [_, setFilter] = useExpenseFilter();

    const [showInfo, setShowInfo] = createSignal(false);

    const [view, setView] = createStore<ViewState>({
        showViewOptions: false,
        dataViewType: "dollar",
    });

    const [data, setData] = createStore<DataStore>({
        totalIncome: 0,
        totalIncomeLoading: false,
        categories: [],
        categoriesLoading: false,
        debugLoading: false,
    });

    const isLoading = createMemo(() =>
        data.totalIncomeLoading ||
        data.categoriesLoading ||
        data.debugLoading);

    const totalIncome = createMemo(() => convertPeriod({
        amount: data.totalIncome,
        currentPeriod: { amount: 1, type: PeriodType.YEAR },
        targetPeriod: context.period,
    }));

    const [chartConfig, setChartConfig] = createSignal<ChartConfiguration>(getChartConfig({
        income: data.totalIncome,
        categories: data.categories,
        viewType: view.dataViewType,
        period: context.period,
        currencyFormat: (_) => "",
        theme: theme()
    }));

    async function loadData(): Promise<void> {
        const budgetId = context.id;

        if (!budgetId) {
            // TODO: handle budget id not set
            return;
        }

        await Promise.all([
            loadTotalIncome(budgetId),
            loadCategories(budgetId),
            artificialDelay(100),
        ]);
    }

    function artificialDelay(delay: number): Promise<void> {
        setData("debugLoading", true);
        return new Promise((resolve) => setTimeout(() => {
            setData("debugLoading", false);
            resolve();
        }, delay));
    }

    async function loadTotalIncome(budgetId: string): Promise<void> {
        setData("totalIncomeLoading", true);
        await core
            .getTotalIncome({ budgetId })
            .then((total) => setData("totalIncome", total))
            .finally(() => setData("totalIncomeLoading", false));
    }

    async function loadCategories(budgetId: string): Promise<void> {
        setData("categoriesLoading", true);
        await core
            .getCategories({ budgetId, search: "" })
            .then((categories) => setData("categories", categories))
            .finally(() => setData("categoriesLoading", false));
    }

    let chartRef!: HTMLCanvasElement;
    let chart: Chart | null;

    createEffect(() => {
        const debounce = 200;
        const nextConfig = chartConfig();
        const handler = setTimeout(() => createChart(nextConfig), debounce);

        // Clean up on next run
        onCleanup(() => clearTimeout(handler));
    });

    function updateChartConfig(): void {
        const config = getChartConfig({
            income: data.totalIncome,
            categories: data.categories,
            viewType: view.dataViewType,
            period: context.period,
            currencyFormat: (amount) => t("Core.CurrencyFormat", amount)!,
            theme: theme(),
        });

        setChartConfig(config);
    }

    function createChart(config: ChartConfiguration): void {
        Chart.register([
            DoughnutController,
            ArcElement,
            ChartDataLabels,
        ]);

        chart?.destroy();
        chart = new Chart(chartRef, config);
    }

    async function onAppearing(): Promise<void> {
        await loadData();
        updateChartConfig();
    }

    function onDisappearing(): void {
        chart?.destroy();
        chart = null;
    }

    return (
        <Page
            title={t("ManagePage.Title")!}
            leadingIcon={XIcon}
            leadingAction={async () => await pop()}
            trailingIcon={InfoIcon}
            trailingAction={() => setShowInfo(true)}
            onappearing={onAppearing}
            ondisappearing={onDisappearing}>

            <InformationDialog
                show={showInfo()}
                title={t("ManagePage.Title")!}
                text={t("ManagePage.Information")!}
                ondismiss={() => setShowInfo(false)} />

            <Switch fallback={(
                <div class="flex-1 flex flex-col justify-center items-center">
                    <LoadingIndicator />
                </div>
            )}>
                <Match when={!isLoading()}>
                    <>
                        <span class="p-sm">
                            <button
                                type="button"
                                class="w-full button button-leading-icon bg-primary text-primary-content justify-center"
                                onclick={() => setView("showViewOptions", true)}>
                                <EyeIcon size={20} />
                                <span>{t("ManagePage.View")}</span>
                            </button>

                            <FormDialog
                                show={view.showViewOptions}
                                title={t("ManagePage.View")!}
                                oncancel={() => setView("showViewOptions", false)}>

                                <Dropdown
                                    items={["dollar", "percentage"] as DataViewType[]}
                                    title={t("ManagePage.ViewChartBy")!}
                                    value={view.dataViewType}
                                    getName={(value) => t("ManagePage.DataViewType", value!)!}
                                    areEqual={(a, b) => a === b}
                                    onselected={(value) => {
                                        setView("dataViewType", value);
                                        updateChartConfig();
                                    }} />

                                <span class="text-xl text-surface-content text-center">{t("ManagePage.ShowAmountsFor")}:</span>

                                <PeriodPicker
                                    value={context.period}
                                    onamountchanged={(amount) => {
                                        setContext("period", { amount, type: context.period.type });
                                        updateChartConfig();
                                    }}
                                    ontypechanged={(type) => {
                                        setContext("period", { amount: context.period.amount, type });
                                        updateChartConfig();
                                    }} />
                            </FormDialog>
                        </span>

                        <hr class="text-border" />

                        <div class="flex-1 flex flex-col justify-center items-center p-sm">
                            <Switch fallback={(
                                <div class="bg-surface-200 text-surface-content rounded-surface h-24 items-center flex flex-row gap-sm justify-center w-full">
                                    <p class="text-center text-xl">{t("ManagePage.YouHaveNoIncome")}</p>
                                    <FrownIcon />
                                </div>
                            )}>
                                <Match when={data.totalIncome > 0}>
                                    <canvas ref={chartRef}></canvas>
                                    <span class="absolute top-1/2 left-1/2 text-2xl text-black bg-white py-xs px-sm rounded-sm -translate-x-1/2">{t("Core.CurrencyFormat", totalIncome())}</span>
                                </Match>
                            </Switch>
                        </div>

                        <hr class="text-border" />

                        <nav class="flex flex-row w-full overflow-x-auto gap-sm p-sm">
                            <ConfigItem
                                icon={HandCoinsIcon}
                                title={t("IncomePage.Title")!}
                                onclick={async () => await push(Income)} />
                            <ConfigItem
                                icon={PiggyBankIcon}
                                title={t("AccountsPage.Title")!}
                                onclick={async () => await push(Accounts)} />
                            <ConfigItem
                                icon={ShapesIcon}
                                title={t("CategoriesPage.Title")!}
                                onclick={async () => await push(Categories)} />
                            <ConfigItem
                                icon={CircleDollarSignIcon}
                                title={t("ExpensesPage.Title")!}
                                onclick={async () => {
                                    setFilter({
                                        search: undefined,
                                        category: undefined,
                                        account: undefined,
                                    });
                                    await push(Expenses);
                                }} />
                        </nav>
                    </>
                </Match>
            </Switch>
        </Page >
    );
};

export default Manage;

type ConfigItemProps = {
    icon: LucideIcon;
    title: string;
    onclick?: () => void;
};

const ConfigItem: Component<ConfigItemProps> = (props) => {
    return (
        <button
            type="button"
            class="flex flex-row gap-xs items-center bg-surface-200 rounded-surface border border-border px-md h-16 text-surface-content"
            onclick={props.onclick}>
            <props.icon />
            <span class="text-xl">{props.title}</span>
        </button>
    );
};