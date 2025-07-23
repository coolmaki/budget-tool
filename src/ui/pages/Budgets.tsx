import { useCore } from "@/app/core";
import { useI18n } from "@/app/i18n";
import { useLogging } from "@/app/logging";
import { BudgetNameAlreadyUsedError } from "@/core/errors";
import { Budget } from "@/core/models";
import Button from "@/ui/components/Button";
import { TextInput } from "@/ui/components/form/TextInput";
import LoadingIndicator from "@/ui/components/LoadingIndicator";
import Page from "@/ui/Page";
import { FrownIcon, PlusIcon } from "lucide-solid";
import { Component, createResource, createSignal, For, Match, Show, Suspense, Switch } from "solid-js";
import { Portal } from "solid-js/web";

const Budgets: Component = () => {
    const { t } = useI18n();
    const core = useCore();
    const logger = useLogging();

    const [budgetName, setBudgetName] = createSignal("");
    const [isDialogOpen, setIsDialogOpen] = createSignal(false);

    const [budgets, { refetch }] = createResource(fetchBudgets);

    async function fetchBudgets(): Promise<Budget[]> {
        const budgets = await core.getBudgets();
        return budgets;
    }

    async function createBudget(name: string): Promise<void> {
        await core
            .createBudget({ name })
            .then(async () => {
                await refetch();
            })
            .catch(error => {
                // TODO: handle error
                if (error instanceof BudgetNameAlreadyUsedError) {
                    const message = t("SettingsPage.Errors.BudgetNameAlreadyUsed", error.name);
                    logger.warn(message);
                    return;
                }

                const message = t("Global.Errors.Unhandled");
                logger.error(message, error);
            })
            .finally(() => setIsDialogOpen(false));
    }

    return (
        <Page
            isRoot={true}
            title={t("BudgetsPage.Title")}>

            {/* Content */}
            <main
                class="flex-1 flex flex-col px-4 gap-4"
                classList={{
                    "justify-center":
                        budgets.loading ||
                        budgets.error,
                }}>
                <Suspense fallback={<LoadingIndicator />}>
                    <Switch>

                        {/* Error */}
                        <Match when={budgets.error}>
                            <div>Error: {budgets.error}</div>
                        </Match>

                        {/* No Result */}
                        <Match when={budgets()?.length === 0}>
                            <div class="bg-base-300 text-base-content rounded-md h-24 items-center flex flex-row gap-2 justify-center">
                                <p class="text-center text-xl">{t("BudgetsPage.YouHaveNoBudgets")}</p>
                                <FrownIcon />
                            </div>
                        </Match>

                        {/* Budget Cards */}
                        <Match when={budgets()?.length}>
                            <For each={budgets()}>
                                {(budget) => (
                                    <div class="rounded-md shadow-sm border border-primary h-24 px-4 py-2">
                                        <p>{budget.name}</p>
                                    </div>
                                )}
                            </For>
                        </Match>
                    </Switch>
                </Suspense>
            </main>

            {/* Create New Budget */}
            <div class="shrink-0 p-4">
                <Button
                    class="w-full text-center"
                    size="lg"
                    icon={PlusIcon}
                    text={t("BudgetsPage.NewBudget")}
                    onclick={() => {
                        setBudgetName("");
                        setIsDialogOpen(true);
                    }} />
            </div>

            {/* Create New Budget Dialog */}
            <Show when={isDialogOpen()}>
                <Portal>
                    <div
                        class="flex flex-col justify-center items-center fixed top-0 left-0 h-screen w-screen before:absolute before:w-full before:h-full before:bg-black before:opacity-50"
                        onclick={() => setIsDialogOpen(false)}>
                        <div
                            class="flex flex-col gap-4 rounded-md bg-base-100 z-10 p-4"
                            onClick={(e) => { e.stopPropagation(); }}>
                            <TextInput
                                value=""
                                placeholder="Budget Name"
                                oninput={(value) => setBudgetName(value)} />
                            <Button
                                class="text-center"
                                text="Save"
                                onclick={async () => await createBudget(budgetName())} />
                        </div>
                    </div>
                </Portal>
            </Show>
        </Page>
    );
};

export default Budgets; 