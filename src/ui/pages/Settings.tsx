import { useCore } from "@/app/core";
import { useI18n } from "@/app/i18n";
import { useTheme } from "@/app/themes";
import Button from "@/ui/components/Button";
import Page from "@/ui/Page";
import { Trash2Icon } from "lucide-solid";
import { Component } from "solid-js";

const Settings: Component = () => {
    const { t } = useI18n();
    const { theme, setTheme } = useTheme();
    const core = useCore();

    return (
        <Page
            isRoot={true}
            title={t("SettingsPage.Title")}>
            <main class="flex-1 flex flex-col p-4 gap-4">

                {/* Appearance */}
                <section class="bg-base-100 text-base-content rounded-surface p-4 shadow-md">
                    <h2 class="text-xl font-semibold mb-4">{t("SettingsPage.Sections.Appearance.Title")}</h2>
                    <div class="flex flex-col gap-2">
                        <select
                            value={theme()}
                            onchange={(e) => setTheme(e.currentTarget.value as "light" | "dark" | "system")}
                            class="select select-bordered w-full max-w-xs">
                            <option value="system">{t("SettingsPage.Sections.Appearance.Themes.System")}</option>
                            <option value="light">{t("SettingsPage.Sections.Appearance.Themes.Light")}</option>
                            <option value="dark">{t("SettingsPage.Sections.Appearance.Themes.Dark")}</option>
                        </select>
                    </div>
                </section>

                {/* Data */}
                <section class="bg-base-100 text-base-content rounded-surface p-4 shadow-md">
                    <h2 class="text-xl font-semibold mb-4">{t("SettingsPage.Sections.Data.Title")}</h2>
                    <div class="flex flex-col gap-2">
                        <Button
                            size="lg"
                            style="error"
                            icon={Trash2Icon}
                            text={t("SettingsPage.Sections.Data.ClearData")}
                            onclick={async () => {
                                await core.clearData();
                            }} />
                    </div>
                </section>
            </main>
        </Page>
    );
};

export default Settings; 