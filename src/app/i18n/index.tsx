import * as en from "@/app/i18n/locale-en";
import { useLoading } from "@/app/loading";
import * as i18n from "@solid-primitives/i18n";
import { Accessor, createContext, createMemo, createResource, createSignal, JSX, ParentProps, Setter, useContext } from "solid-js";

export type TranslationDictionary = typeof en.dict;

export type Locale = "en" | "fr" | "es";

export type Dictionary = i18n.Flatten<TranslationDictionary>;

export async function fetchDictionary(locale: Locale): Promise<Dictionary> {
    const dict: TranslationDictionary = (await import(`./locale-${locale}.ts`)).dict;
    return i18n.flatten(dict); // flatten the dictionary to make all nested keys available top-level
}

type I18nContext = {
    locale: Accessor<Locale>;
    setLocale: Setter<Locale>;
    t: i18n.NullableTranslator<Dictionary, string>;
}

const I18nContext = createContext<I18nContext>();

export function I18nContextProvider(props: ParentProps): JSX.Element {
    const [locale, setLocale] = createSignal<Locale>("en");
    const { loadWhile } = useLoading();

    function fetchDictionaryWithLoading(locale: Locale): Promise<Dictionary> {
        return loadWhile(() => fetchDictionary(locale));
    }

    const [dict] = createResource(locale, fetchDictionaryWithLoading, { initialValue: i18n.flatten(en.dict) });
    const t = createMemo(() => i18n.translator(dict));

    return (
        <I18nContext.Provider value={{ locale, setLocale, t: t() }}>
            {props.children}
        </I18nContext.Provider>
    );
}

export function useI18n(): I18nContext {
    const context = useContext(I18nContext);
    return context!;
}
