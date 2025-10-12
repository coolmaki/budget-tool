/* @refresh reload */
import { AppContextBuilder } from "@/app";
import { BudgetContextProvider, CoreContextProvider } from "@/app/core";
import { I18nContextProvider } from "@/app/i18n";
import { LoadingContextProvider } from "@/app/loading";
import { LoggingProvider } from "@/app/logging";
import { NavigationContextProvider } from "@/app/navigation";
import { ThemeContextProvider } from "@/app/themes";
import { UpdatesContextProvider } from "@/app/updates";
import "@/index.css";
import Bootstrapper from "@/ui/Bootstrapper";
import { ExpenseEditorContextProvider } from "@/ui/contexts/ExpenseEditorContext";
import { render } from "solid-js/web";

// ------------------------------------------------------------
// App Entry Point
// ------------------------------------------------------------

const AppContext = new AppContextBuilder()
    .use(LoggingProvider)
    .use(UpdatesContextProvider)
    .use(LoadingContextProvider)
    .use(I18nContextProvider)
    .use(ThemeContextProvider)
    .use(NavigationContextProvider)
    .use(CoreContextProvider)
    .use(BudgetContextProvider)
    .use(ExpenseEditorContextProvider)
    .build();

const loadingPlaceholder = document.getElementById("loading-placeholder")!;
loadingPlaceholder.remove();

const root = document.getElementById("root")!;
render(
    () => (
        <AppContext>
            <Bootstrapper />
        </AppContext>
    ),
    root);
