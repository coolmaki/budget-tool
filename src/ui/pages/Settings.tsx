import { useCore } from "@/app/core";
import { useI18n } from "@/app/i18n";
import { useLoading } from "@/app/loading";
import { useNavigation } from "@/app/navigation";
import { Theme, useTheme } from "@/app/themes";
import BottomSheet from "@/ui/components/BottomSheet";
import Page from "@/ui/templates/Page";
import clsx from "clsx";
import { ChevronDownIcon, ChevronLeftIcon, Trash2Icon } from "lucide-solid";
import { Component, createSignal, For, ParentComponent } from "solid-js";

const Settings: Component = () => {
    const { t } = useI18n();
    const { theme, setTheme } = useTheme();
    const { loadWhile } = useLoading();
    const core = useCore();
    const { pop } = useNavigation();

    const [showThemePicker, setShowThemePicker] = createSignal(false);

    function clearData(): Promise<void> {
        return loadWhile(async () => await core.clearData());
    }

    return (
        <Page
            title={t("SettingsPage.Title")!}
            leadingIcon={ChevronLeftIcon}
            leadingAction={async () => await pop()}>
            <main class="flex-1 flex flex-col p-4 gap-4">

                {/* Appearance */}
                <Section title={t("SettingsPage.Sections.Appearance.Title")!}>
                    <button
                        class="button button-border bg-surface-200 flex flex-row justify-between items-center"
                        onclick={() => setShowThemePicker(true)}>
                        <span>{t("SettingsPage.Sections.Appearance.Themes", theme())}</span>
                        <ChevronDownIcon size={20} />
                    </button>

                    <BottomSheet
                        show={showThemePicker()}
                        ondismiss={() => setShowThemePicker(false)}>
                        <div class="flex flex-col w-full">
                            <For each={["system", "light", "dark"] satisfies Theme[]}>
                                {(item) => (
                                    <div
                                        onclick={() => { setTheme(item); setShowThemePicker(false); }}
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

                {/* Data */}
                <Section title={t("SettingsPage.Sections.Data.Title")!}>
                    <button
                        type="button"
                        class="button button-leading-icon bg-error text-error-content flex flex-row gap-"
                        onclick={clearData}>
                        <Trash2Icon size={20} />
                        <span>{t("SettingsPage.Sections.Data.ClearData")}</span>
                    </button>
                </Section>
            </main>
        </Page>
    );
};

type SectionProps = {
    title: string;
};

const Section: ParentComponent<SectionProps> = (props) => {
    return (
        <section class="bg-surface-100 text-surface-content">
            <h2 class="text-xl font-semibold mb-4">{props.title}</h2>
            <div class="flex flex-col gap-2">
                {props.children}
            </div>
        </section>
    );
};

export default Settings; 