import { useI18n } from "@/app/i18n";
import { useNavigation } from "@/app/navigation";
import IconButton from "@/ui/components/IconButton";
import Budgets from "@/ui/pages/Budgets";
import Settings from "@/ui/pages/Settings";
import clsx from "clsx";
import { ChartPieIcon, SettingsIcon, XIcon } from "lucide-solid";
import { Component, Show } from "solid-js";

const NavMenu: Component = () => {
    const { isOpen, setIsOpen, stack, setRoot } = useNavigation();
    const { t } = useI18n();

    const navItems = [
        { icon: ChartPieIcon, label: t("BudgetsPage.Title"), component: Budgets },
        { icon: SettingsIcon, label: t("SettingsPage.Title"), component: Settings },
    ];

    return (
        <nav
            class={clsx(
                "z-30 absolute inset-0 flex flex-col p-4 gap-4 bg-base-100 shadow-lg transition-all duration-500",
                isOpen() ? undefined : "opacity-0 -translate-x-full translate-y-1/6",
            )}>
            <div class="flex flex-row items-center justify-between">
                <h1 class="text-2xl font-semibold text-base-content">Budget Tool</h1>
                <Show when={stack.value.length >= 1}>
                    <IconButton
                        color="base-100"
                        icon={XIcon}
                        onselected={() => setIsOpen(false)}
                        size="md" />
                </Show>
            </div>

            <div class="flex flex-col gap-2">
                {navItems.map((item) => (
                    <button
                        onclick={() => setRoot(item.component)}
                        class="flex flex-row items-center gap-4 p-4 rounded-surface bg-base-200 hover:bg-base-300 transition-colors duration-200 text-base-content w-full text-left">
                        <item.icon class="w-6 h-6" />
                        <span class="text-lg">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default NavMenu;
