import { Accessor, createContext, createEffect, createSignal, JSX, ParentProps, Setter, useContext } from "solid-js";

export type Theme =
    | "system"
    | "light"
    | "dark";

export type ThemeColor =
    | "base-100"
    | "base-200"
    | "base-300"
    | "primary"
    | "secondary"
    | "accent"
    | "neutral"
    | "info"
    | "success"
    | "warning"
    | "error";

export function getSurfaceColor(themeColor: ThemeColor): string {
    return `bg-${themeColor}`;
}

export function getTextColor(themeColor: ThemeColor): string {
    switch (themeColor) {
        case "base-100":
        case "base-200":
        case "base-300":
            return "text-base-content";
        default:
            return `text-${themeColor}`;
    }
}

type ThemeContext = {
    theme: Accessor<Theme>;
    setTheme: Setter<Theme>;
};

const ThemeContext = createContext<ThemeContext>();

export function ThemeContextProvider(props: ParentProps): JSX.Element {
    const [theme, setTheme] = createSignal(initTheme());

    createEffect(() => {
        updateTheme(theme());
    }, theme());

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {props.children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContext {
    const context = useContext(ThemeContext);
    return context!;
}

const ThemeKey = "theme";

function getTheme(): Theme {
    switch (localStorage.getItem(ThemeKey) as Theme) {
        case "light": return "light";
        case "dark": return "dark";
        default: return "system";
    }
}

function initTheme(): Theme {
    const theme = getTheme();
    updateTheme(theme);

    getDarkThemeMediaQuery().addEventListener("change", (e) => {
        const currentTheme = getTheme();
        if (currentTheme === "system") {
            const theme = getSystemTheme(e.matches);
            setBodyThemeClass(theme);
        }
    });

    return theme;
}

function updateTheme(theme: Theme): void {
    localStorage.setItem(ThemeKey, theme);

    const themeValue = theme === "system"
        ? handleSystemTheme()
        : handleAppTheme(theme);

    setBodyThemeClass(themeValue);
}

function handleSystemTheme(): Theme {
    const darkThemeMediaQuery = getDarkThemeMediaQuery();
    return getSystemTheme(darkThemeMediaQuery.matches);
}

function handleAppTheme(theme: Theme): Theme {
    return theme;
}

function getSystemTheme(isDark: boolean): Theme {
    return isDark ? "dark" : "light";
}

function getDarkThemeMediaQuery(): MediaQueryList {
    return window.matchMedia("(prefers-color-scheme: dark)");
}

function setBodyThemeClass(theme: Theme): void {
    document.body.classList.value = theme;
}
