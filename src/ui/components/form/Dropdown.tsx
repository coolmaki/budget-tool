import BottomSheet from "@/ui/components/BottomSheet";
import clsx from "clsx";
import { ChevronDownIcon } from "lucide-solid";
import { createSignal, For, JSX, Show } from "solid-js";

type DropdownProps<T> = {
    class?: string;
    title?: string;
    value?: T;
    items: T[];
    getName: (item?: T) => string;
    areEqual: (a?: T, b?: T) => boolean;
    onselected?: (item: T) => void;
    ondismissed?: () => void;
};

const Dropdown: (<T>(props: DropdownProps<T>) => JSX.Element) = (props) => {
    const [show, setShow] = createSignal(false);

    return (
        <>
            <button
                class="flex-1 button button-border bg-surface-200 text-surface-content flex flex-row justify-between items-center"
                onclick={() => setShow(true)}>
                <span>{props.getName(props.value)}</span>
                <ChevronDownIcon size={20} />
            </button>

            <BottomSheet
                show={show()}
                ondismiss={() => setShow(false)}>
                <div class="flex flex-col w-full">
                    <Show when={props.title}>
                        <>
                            <span class="bg-surface-200 text-medium-emphasis text-lg flex flex-row items-center w-full h-14 justify-center">{props.title}</span>
                            <hr class="text-border" />
                        </>
                    </Show>
                    <For each={props.items}>
                        {(item) => (
                            <div
                                onclick={() => { props.onselected?.(item); setShow(false); }}
                                class={clsx(
                                    "bg-surface-200 text-lg flex flex-row items-center w-full h-14 justify-center",
                                    props.areEqual(item, props.value) ? "text-info" : "text-surface-content")}>
                                {props.getName(item)}
                            </div>
                        )}
                    </For>
                </div>
            </BottomSheet>
        </>
    );
};

export default Dropdown;
