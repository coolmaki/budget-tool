import { useCore } from "@/app/core";
import { useI18n } from "@/app/i18n";
import { useLoading } from "@/app/loading";
import { useNavigation } from "@/app/navigation";
import { Theme, useTheme } from "@/app/themes";
import { useUpdates } from "@/app/updates";
import BottomSheet from "@/ui/components/BottomSheet";
import ConfirmDialog from "@/ui/components/dialogs/ConfirmDialog";
import Page from "@/ui/templates/Page";
import clsx from "clsx";
import { ChevronDownIcon, ChevronLeftIcon, DownloadIcon, RefreshCwIcon, Trash2Icon, UploadIcon } from "lucide-solid";
import { Component, For, Match, ParentComponent, Switch } from "solid-js";
import { createStore } from "solid-js/store";

type State = {
    showThemePicker: boolean;
    showImportDataConfirmation: boolean;
    showClearDataConfirmation: boolean;
};

const Settings: Component = () => {
    const { t } = useI18n();
    const { theme, setTheme } = useTheme();
    const { loadWhile } = useLoading();
    const core = useCore();
    const { pop } = useNavigation();
    const { updateStatus, updateApplication } = useUpdates();

    const [state, setState] = createStore<State>({
        showThemePicker: false,
        showImportDataConfirmation: false,
        showClearDataConfirmation: false,
    });

    async function importData(): Promise<void> {
        setState("showImportDataConfirmation", false);

        const [handle] = await window.showOpenFilePicker({
            multiple: false,
            types: [
                {
                    description: "SQLite Database",
                    accept: { "application/x-sqlite3": [".db"] },
                },
            ],
        });

        // TODO: validate file

        await core.disconnect(); // Ensure worker thread is not holding on to file
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle("core.db", { create: true });
        const writeable = await fileHandle.createWritable();
        writeable.write(await handle.getFile());
        await writeable.close();
    }

    async function exportData(): Promise<void> {
        await core.disconnect(); // Ensure worker thread is not holding on to file

        const saveHandle = await window.showSaveFilePicker({
            suggestedName: "budget-tool-data.db",
            types: [
                {
                    description: "SQLite Database",
                    accept: { "application/x-sqlite3": [".db"] },
                },
            ],
        });

        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle("core.db");

        const writeable = await saveHandle.createWritable();
        writeable.write(await fileHandle.getFile());
        await writeable.close();
    }

    function clearData(): Promise<void> {
        return loadWhile(async () => await core.clearData());
    }

    return (
        <Page
            title={t("SettingsPage.Title")!}
            leadingIcon={ChevronLeftIcon}
            leadingAction={async () => await pop()}>
            <main class="flex-1 flex flex-col p-sm gap-sm">

                {/* Appearance */}
                <Section title={t("SettingsPage.Sections.Appearance.Title")!}>
                    <button
                        class="button button-border bg-surface-200 flex flex-row justify-between items-center"
                        onclick={() => setState("showThemePicker", true)}>
                        <span>{t("SettingsPage.Sections.Appearance.Themes", theme())}</span>
                        <ChevronDownIcon size={20} />
                    </button>

                    <BottomSheet
                        show={state.showThemePicker}
                        ondismiss={() => setState("showThemePicker", false)}>
                        <div class="flex flex-col w-full">
                            <For each={["system", "light", "dark"] satisfies Theme[]}>
                                {(item) => (
                                    <div
                                        onclick={() => { setTheme(item); setState("showThemePicker", false); }}
                                        class={clsx(
                                            "bg-surface-200 text-lg flex flex-row items-center w-full h-14 justify-center",
                                            theme() === item ? "text-info" : "text-surface-content")}>
                                        {t("SettingsPage.Sections.Appearance.Themes", item)}
                                    </div>
                                )}
                            </For>
                        </div>
                    </BottomSheet>
                </Section>

                {/* Updates */}
                <Section title={t("SettingsPage.Sections.Updates.Title")!}>
                    <button
                        disabled={updateStatus() === "none"}
                        type="button"
                        class="button button-leading-icon bg-error text-error-content flex flex-row gap-xs"
                        classList={{
                            "bg-medium-emphasis text-border": updateStatus() === "none",
                            "bg-warning text-warning-content": updateStatus() === "available",
                            "bg-error text-error-content": updateStatus() === "error",
                        }}
                        onclick={async () => await updateApplication(true)}>
                        <RefreshCwIcon size={20} />
                        <span>
                            <Switch fallback={t("SettingsPage.Sections.Updates.NoUpdateAvailable")}>
                                <Match when={updateStatus() === "error"}>{t("SettingsPage.Sections.Updates.UpdateError")}</Match>
                                <Match when={updateStatus() === "available"}>{t("SettingsPage.Sections.Updates.UpdateAvailable")}</Match>
                            </Switch>
                        </span>
                    </button>
                </Section>

                {/* Data */}
                <Section title={t("SettingsPage.Sections.Data.Title")!}>

                    {/* Import Data */}
                    <button
                        type="button"
                        class="button button-leading-icon bg-neutral text-neutral-content flex flex-row gap-xs"
                        onclick={() => setState("showImportDataConfirmation", true)}>
                        <UploadIcon size={20} />
                        <span>{t("SettingsPage.Sections.Data.ImportData")}</span>
                    </button>
                    <ConfirmDialog
                        show={state.showImportDataConfirmation}
                        title={t("SettingsPage.Sections.Data.ImportDataConfirmationTitle")!}
                        message={t("SettingsPage.Sections.Data.ImportDataConfirmationMessage")!}
                        onconfirm={importData}
                        oncancel={() => setState("showImportDataConfirmation", false)} />

                    {/* Export Data */}
                    <button
                        type="button"
                        class="button button-leading-icon bg-neutral text-neutral-content flex flex-row gap-xs"
                        onclick={exportData}>
                        <DownloadIcon size={20} />
                        <span>{t("SettingsPage.Sections.Data.ExportData")}</span>
                    </button>

                    {/* Clear Data */}
                    <button
                        type="button"
                        class="button button-leading-icon bg-error text-error-content flex flex-row gap-xs"
                        onclick={() => setState("showClearDataConfirmation", true)}>
                        <Trash2Icon size={20} />
                        <span>{t("SettingsPage.Sections.Data.ClearData")}</span>
                    </button>
                    <ConfirmDialog
                        show={state.showClearDataConfirmation}
                        title={t("SettingsPage.Sections.Data.ClearDataConfirmationTitle")!}
                        message={t("SettingsPage.Sections.Data.ClearDataConfirmationMessage")!}
                        onconfirm={clearData}
                        oncancel={() => setState("showClearDataConfirmation", false)} />
                </Section>
            </main>
        </Page >
    );
};

type SectionProps = {
    title: string;
};

const Section: ParentComponent<SectionProps> = (props) => {
    return (
        <section class="bg-surface-100 text-surface-content">
            <h2 class="text-xl font-semibold mb-4">{props.title}</h2>
            <div class="flex flex-col gap-sm">
                {props.children}
            </div>
        </section>
    );
};

export default Settings; 