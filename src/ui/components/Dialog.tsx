import clsx from "clsx";
import { Accessor, createContext, createSignal, JSX, onCleanup, onMount, ParentProps, Setter, Show, useContext } from "solid-js";
import { Portal } from "solid-js/web";

// ------------------------------------------------------------
// component with context
// ------------------------------------------------------------

type DialogState = "hidden" | "visible" | "hiding" | "showing";

type DialogContext = {
    state: Accessor<DialogState>;
    setState: Setter<DialogState>;
};

const DialogContext = createContext<DialogContext>();

export function useDialog(): DialogContext {
    const context = useContext(DialogContext)!;
    return context;
}

export function Dialog(props: ParentProps): JSX.Element {
    const [state, setState] = createSignal<DialogState>("hidden");

    return (
        <DialogContext.Provider value={{ state, setState }}>
            {props.children}
        </DialogContext.Provider>
    );
}

// ------------------------------------------------------------
// trigger
// ------------------------------------------------------------

Dialog.Trigger = function Trigger(props: ParentProps<{ class?: string }>): JSX.Element {
    const { setState } = useDialog();

    function showDialog(): void {
        setState("showing");
        setTimeout(() => {
            setState("visible");
        });
    }

    return (
        <span
            class={props.class}
            onclick={showDialog}>
            {props.children}
        </span>
    );
}

// ------------------------------------------------------------
// content
// ------------------------------------------------------------

const animationDuration = 3000;

Dialog.Content = function Content(props: ParentProps): JSX.Element {
    const { state, setState } = useDialog();

    let dialogRef!: HTMLDivElement;

    function handleClick(e: MouseEvent): void {
        if (!dialogRef) {
            return;
        }

        if (state() === "showing") {
            return;
        }

        const shouldHide = state() === "visible" && !dialogRef.contains(e.target as Node);

        if (shouldHide) {
            setState("hiding");
            setTimeout(() => {
                setState("hidden")
            }, animationDuration);
        }
    }

    onMount(() => document.addEventListener("click", handleClick));
    onCleanup(() => document.removeEventListener("click", handleClick));

    return (
        <Show when={state() !== "hidden"}>
            <Portal mount={document.querySelector("body") || undefined}>
                <div
                    ref={dialogRef}
                    class={clsx(
                        "fixed top-1/2 left-1/2 -translate-x-1/2  shadow-md rounded-surface bg-base-100 transition-all duration-300",
                        state() === "visible" ? "-translate-y-1/2" : "-translate-y-full  top-full opacity-0")}>
                    {props.children}
                </div>
            </Portal>
        </Show >
    );
}