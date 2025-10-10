/* @refresh reload */
import { AppContextBuilder } from "@/app";
import { BudgetContextProvider, CoreContextProvider } from "@/app/core";
import { I18nContextProvider } from "@/app/i18n";
import { LoadingContextProvider } from "@/app/loading";
import { LoggingProvider } from "@/app/logging";
import { NavigationContextProvider } from "@/app/navigation";
import { ThemeContextProvider } from "@/app/themes";
import "@/index.css";
import Bootstrapper from "@/ui/Bootstrapper";
import { render } from "solid-js/web";

// ------------------------------------------------------------
// Service Worker Config
// ------------------------------------------------------------

// https://vite-pwa-org.netlify.app/frameworks/solidjs
import { useRegisterSW } from 'virtual:pwa-register/solid';

const intervalMS = 60 * 60 * 1000

const updateServiceWorker = useRegisterSW({
    onRegistered(r) {
        r && setInterval(() => {
            r.update()
        }, intervalMS)
    }
})

// ------------------------------------------------------------
// App Entry Point
// ------------------------------------------------------------

const AppContext = new AppContextBuilder()
    .use(LoggingProvider)
    .use(LoadingContextProvider)
    .use(I18nContextProvider)
    .use(ThemeContextProvider)
    .use(NavigationContextProvider)
    .use(CoreContextProvider)
    .use(BudgetContextProvider)
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
