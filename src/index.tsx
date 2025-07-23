/* @refresh reload */
import { AppContextBuilder } from "@/app";
import { CoreContextProvider } from "@/app/core";
import { I18nContextProvider } from "@/app/i18n";
import { LoadingContextProvider } from "@/app/loading";
import { LoggingProvider } from "@/app/logging";
import { NavigationContextProvider } from "@/app/navigation";
import { ThemeContextProvider } from "@/app/themes";
import "@/index.css";
import Bootstrapper from "@/ui/Bootstrapper";
import { render } from "solid-js/web";

const AppContext = new AppContextBuilder()
    .use(LoggingProvider)
    .use(LoadingContextProvider)
    .use(I18nContextProvider)
    .use(ThemeContextProvider)
    .use(NavigationContextProvider)
    .use(CoreContextProvider)
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
