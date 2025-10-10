import clsx from "clsx";
import { createEffect, createSignal, ParentComponent, Show } from "solid-js";
import { Portal } from "solid-js/web";

const animationDuration = 300;

type DialogProps = {
    show?: boolean;
    ondismiss?: () => void;
};

type DialogState =
    | "hidden"
    | "transitioning"
    | "visible";

const Dialog: ParentComponent<DialogProps> = (props) => {
    const [state, setState] = createSignal<DialogState>(props.show ? "visible" : "hidden");

    function dismiss(e: MouseEvent): void {
        e.stopPropagation();

        if (!(e.target instanceof Node)) return;
        if (state() !== "visible") return;

        if (props.ondismiss) {
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
                <div class="fixed top-0 left-0 w-screen h-screen z-10">
                    {/* Background */}
                    <span
                        onclick={dismiss}
                        class={clsx(
                            "absolute top-0 right-0 inline-block w-full h-full bg-black transition-all ease-linear duration-300",
                            state() === "visible" ? "opacity-50" : "opacity-0"
                        )}></span>

                    {/* Content */}
                    <div class={clsx(
                        "absolute left-1/2 -translate-x-1/2 transition-all ease-in-out duration-300",
                        state() === "visible" ? "bottom-1/2 translate-y-1/2" : "bottom-0 translate-y-full")}>
                        {props.children}
                    </div>
                </div>
            </Portal>
        </Show>
    );
}

export default Dialog;
