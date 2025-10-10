import clsx from "clsx";
import { createEffect, createSignal, onCleanup, onMount, ParentComponent, Show } from "solid-js";
import { Portal } from "solid-js/web";

const animationDuration = 300;

type BottomSheetProps = {
    show?: boolean;
    ondismiss?: () => void;
};

type BottomSheetState =
    | "hidden"
    | "transitioning"
    | "visible";

const BottomSheet: ParentComponent<BottomSheetProps> = (props) => {
    let contentRef!: HTMLDivElement;

    const [state, setState] = createSignal<BottomSheetState>(props.show ? "visible" : "hidden");

    onMount(() => {
        document.addEventListener("click", onclick);
    });

    onCleanup(() => {
        document.removeEventListener("click", onclick);
    });

    function onclick(e: MouseEvent): void {
        if (!(e.target instanceof Node)) return;
        if (state() !== "visible") return;

        const isDismissed = !contentRef.contains(e.target);

        if (isDismissed && props.ondismiss) {
            props.ondismiss();
        }
    }

    createEffect(() => {

        // Show
        if (props.show) {
            setState("transitioning");
            setTimeout(() => setState("visible"));
        }

        // Hide
        else {
            setState("transitioning");
            setTimeout(
                () => setState("hidden"),
                animationDuration);
        }
    });

    return (
        <Show when={state() !== "hidden"}>
            <Portal>
                <div class={clsx(
                    "fixed top-0 left-0 w-screen h-screen z-10",
                    "before:inline-block before:w-full before:h-full before:bg-black before:transition-all before:ease-linear before:duration-300",
                    state() === "visible" ? "before:opacity-50" : "before:opacity-0")}>
                    <div
                        ref={contentRef}
                        class={clsx(
                            "absolute bottom-0 left-1/2 w-full max-h-2/3 shadow-md bg-surface-200 z-10 -translate-x-1/2 rounded-t-surface overflow-clip transition-all ease-in-out duration-300",
                            state() === "visible" ? "translate-y-0" : "translate-y-full",
                        )}>
                        {props.children}
                    </div>
                </div>
            </Portal>
        </Show>
    );
};

export default BottomSheet;
