import { useBudgetContext, useCore } from "@/app/core";
import { useI18n } from "@/app/i18n";
import { useNavigation } from "@/app/navigation";
import { useTheme } from "@/app/themes";
import { convertPeriod } from "@/core/helpers";
import { Category } from "@/core/models";
import { PeriodType } from "@/core/types";
import InformationDialog from "@/ui/components/dialogs/InformationDialog";
import LoadingIndicator from "@/ui/components/LoadingIndicator";
import PeriodPicker from "@/ui/components/PeriodPicker";
import Accounts from "@/ui/pages/Accounts";
import Categories from "@/ui/pages/Categories";
import Expenses from "@/ui/pages/Expenses";
import Income from "@/ui/pages/Income";
import Page from "@/ui/templates/Page";
import { ArcElement, Chart, DoughnutController, type ChartConfiguration } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { CircleDollarSignIcon, FrownIcon, HandCoinsIcon, InfoIcon, LucideIcon, PiggyBankIcon, ShapesIcon, XIcon } from "lucide-solid";
import { createMemo, createSignal, Match, Switch, type Component } from "solid-js";
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

type DataConfig = {
    income: number;
    label: string;
    data: ChartDataItem[];
    labelColor: string;
    textColor: string;
}

function getChartConfig(config: DataConfig): ChartConfiguration {
    return {
        type: "doughnut",
        data: {
            labels: config.data.map((item) => item.label),
            datasets: [
                {
                    label: config.label,
                    data: config.data.map((data) => data.value),
                    backgroundColor: config.data.map((data) => data.color),
                    borderWidth: 0,
                }
            ],
        },
        options: {
            plugins: {
                datalabels: {
                    anchor: "center",
                    align: "center",
                    color: config.textColor,
                    backgroundColor: config.labelColor,
                    borderRadius: 4,
                    font: {
                        weight: "bold",
                        size: 12,
                    },
                    formatter: (value, context) => config.data[context.dataIndex].label + " " + value + "%", // show raw value
                },
            },
        },
        plugins: [ChartDataLabels],
    };
}

const Manage: Component = () => {
    const { t } = useI18n();
    const { pop, push } = useNavigation();
    const { theme } = useTheme();
    const core = useCore();
    const [context, setContext] = useBudgetContext();

    const [showInfo, setShowInfo] = createSignal(false);

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

    async function onAppearing(): Promise<void> {
        await loadData();

        Chart.register([
            DoughnutController,
            ArcElement,
            ChartDataLabels,
        ]);

        const income = data.totalIncome;
        const chartData: ChartDataItem[] = data.categories.map((category) => ({
            label: category.name,
            value: Math.round((category.total / income) * 100),
            color: category.color
        }));

        const remainingIncome: ChartDataItem = {
            label: "Remaining",
            value: 100 - chartData.reduce((total, current) => total + current.value, 0),
            color: theme() === "dark" ? "#929292" : "#A0A0A0",
        };

        chartData.push(remainingIncome);

        const config = getChartConfig({
            income: income,
            label: "Test Chart",
            data: chartData,
            textColor: theme() === "dark" ? "#000000" : "#FFFFFF",
            labelColor: theme() === "dark" ? "#FFFFFF" : "#000000",
        });

        chart = new Chart(chartRef, config);
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
                        <div class="flex flex-col gap-sm p-sm">
                            <span class="text-xl text-surface-content text-center">{t("ManagePage.ShowAmountsFor")}:</span>

                            <PeriodPicker
                                value={context.period}
                                onamountchanged={(amount) => setContext("period", { amount, type: context.period.type })}
                                ontypechanged={(type) => setContext("period", { amount: context.period.amount, type })} />
                        </div>

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
                                    <span class="absolute top-1/2 left-1/2 text-2xl text-black bg-white py-xs px-sm rounded-sm -translate-x-1/2 translate-y-1/2">{t("Core.CurrencyFormat", totalIncome())}</span>
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
                                onclick={async () => await push(Expenses)} />
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