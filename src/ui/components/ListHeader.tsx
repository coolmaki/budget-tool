import { useI18n } from "@/app/i18n";
import TextInput from "@/ui/components/form/TextInput";
import clsx from "clsx";
import { ListFilterIcon, PlusIcon, SearchIcon, XIcon } from "lucide-solid";
import { Component, createEffect, createMemo, createSignal, onCleanup, Show, untrack } from "solid-js";

type ListHeaderProps = {
    class?: string;
    searchPlaceholder?: string;
    searchDebounce?: number;
    onfilter?: () => void;
    onsearch?: (value: string) => void;
    onadd?: (e: MouseEvent) => void;
};

const defaultDebounce = 500;

const ListHeader: Component<ListHeaderProps> = (props) => {
    const { t } = useI18n();

    const [searchValue, setSearchValue] = createSignal("");

    createEffect(() => {
        const value = searchValue();
        const onsearch = untrack(() => props.onsearch);
        const debounce = untrack(() => props.searchDebounce ?? defaultDebounce);
        const handler = setTimeout(() => onsearch?.(value), debounce);

        // Clean up on next run
        onCleanup(() => clearTimeout(handler));
    });

    const clearSearchIcon = createMemo(() => searchValue() ? XIcon : undefined);

    return (
        <div class={clsx(
            "shrink-0 flex flex-row p-sm gap-sm",
            props.class)}>

            {/* Search */}
            <TextInput
                class="flex-1"
                placeholder={props.searchPlaceholder ?? t("Global.Placeholders.Search")}
                // disabled={isLoading()}
                leadingIcon={SearchIcon}
                trailingIcon={clearSearchIcon()}
                ontrailing={() => setSearchValue("")}
                oninput={(value) => setSearchValue(value)}
                value={searchValue()} />

            {/* Filter */}
            <Show when={props.onfilter}>
                <button
                    type="button"
                    class="shrink-0 button-icon-field bg-primary text-primary-content"
                    onclick={props.onfilter}>
                    <ListFilterIcon />
                </button>
            </Show>

            {/* Add */}
            <button
                type="button"
                class="shrink-0 button-icon-field bg-primary text-primary-content"
                onclick={props.onadd}>
                <PlusIcon />
            </button>
        </div>
    );
};

export default ListHeader;
