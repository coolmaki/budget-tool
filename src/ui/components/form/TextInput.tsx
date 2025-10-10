import { type InputState } from "@/ui/components/form";
import clsx, { ClassValue } from "clsx";
import { type LucideIcon } from "lucide-solid";
import { Component, createMemo, Show } from "solid-js";

type TextInputProps = {
    class?: string;
    placeholder?: string;
    value?: string;
    disabled?: boolean
    leadingIcon?: LucideIcon;
    trailingIcon?: LucideIcon;
    onleading?: () => void;
    ontrailing?: () => void;
    oninput?: (value: string) => void;
    state?: InputState;
};

const empty = "";

const TextInput: Component<TextInputProps> = (props: TextInputProps) => {
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
        <div class={clsx(
            "grid items-center min-w-0 grid-cols-1",
            props.disabled ? "text-disabled-content" : "text-surface-content",
            props.class)}>
            <input
                placeholder={props.placeholder}
                value={props.value ?? empty}
                oninput={(e) => props.oninput?.(e.currentTarget.value)}
                class={clsx(
                    "col-start-1 col-end-1 row-start-1 row-end-1 shadow-md focus:shadow-lg rounded-field py-2 h-field",
                    props.disabled ? "bg-disabled" : "bg-surface-200",
                    props.leadingIcon ? "pl-10" : "pl-4",
                    props.trailingIcon ? "pr-10" : "pr-4",
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

export default TextInput;
