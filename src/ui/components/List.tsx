import LoadingIndicator from "@/ui/components/LoadingIndicator";
import { Component, For, JSX, Match, Switch } from "solid-js";

type ListProps<T> = {
    class?: string;
    loading: boolean;
    items: T[];
    itemTemplate: Component<ItemTemplateProps<T>>;
    emptyTemplate: Component;
};

type ItemTemplateProps<T> = {
    item: T;
};

const List: (<T>(props: ListProps<T>) => JSX.Element) = (props) => {
    return (
        <Switch>

            {/* Loading */}
            <Match when={props.loading}>
                <LoadingIndicator />
            </Match>

            {/* No Result */}
            <Match when={props.items.length === 0}>
                <props.emptyTemplate />
            </Match>

            {/* Budget Cards */}
            <Match when={props.items.length}>
                <For each={props.items}>
                    {(item) => <props.itemTemplate item={item} />}
                </For>
            </Match>
        </Switch>
    );
};

export default List;
