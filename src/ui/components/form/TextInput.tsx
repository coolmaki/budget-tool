import clsx, { ClassValue } from "clsx";
import { type LucideIcon } from "lucide-solid";
import { createMemo, type JSX, Show } from "solid-js";
import { type InputState } from ".";

type TextInputProps = {
    placeholder?: string;
    value?: string;
    leadingIcon?: LucideIcon;
    trailingIcon?: LucideIcon;
    onleading?: () => void;
    ontrailing?: () => void;
    oninput?: (value: string) => void;
    state?: InputState;
};

const empty = "";

export function TextInput(props: TextInputProps): JSX.Element {
    const stateClass = createMemo<ClassValue | undefined>(() => {
        switch (props.state) {
            case "valid":
                return "!focus:outline-2 outline-2 outline-success";
            case "invalid":
                return "!focus:outline-2 outline-2 outline-error";
            default:
                return undefined;
        }
    })

    return (
        <div class="grid  items-center">
            <input
                placeholder={props.placeholder}
                value={props.value ?? empty}
                oninput={(e) => props.oninput?.(e.currentTarget.value)}
                class={clsx(
                    "col-start-1 col-end-1 row-start-1 row-end-1 shadow-md focus:shadow-xl rounded-field bg-neutral-200 py-2 h-10",
                    props.leadingIcon ? "pl-10" : "pl-3",
                    props.trailingIcon ? "pr-10" : "pr-3",
                    stateClass(),
                )} />

            <Show when={props.leadingIcon}>
                {(accessor) => {
                    const LeadingIcon = accessor();
                    return <LeadingIcon
                        size={20}
                        class="col-start-1 col-end-1 row-start-1 row-end-1 text-md ml-3 cursor-pointer"
                        onclick={props.onleading} />;
                }}
            </Show>

            <Show when={props.trailingIcon}>
                {(accessor) => {
                    const TrailingIcon = accessor();
                    return <TrailingIcon
                        size={20}
                        class="col-start-1 col-end-1 row-start-1 row-end-1 ml-auto mr-3 cursor-pointer"
                        onclick={props.ontrailing} />;
                }}
            </Show>
        </div>
    );
}
