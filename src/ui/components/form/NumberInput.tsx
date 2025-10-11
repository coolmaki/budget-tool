import clsx, { ClassValue } from "clsx";
import { type LucideIcon } from "lucide-solid";
import { Component, createEffect, createMemo, createSignal, Show } from "solid-js";
import { type InputState } from ".";

type NumberInputProps = {
    class?: string;
    placeholder?: string;
    value?: number;
    min?: number;
    step?: number;
    fractionDigits?: number;
    disabled?: boolean;
    textAlign?: "start" | "center" | "end";
    leadingIcon?: LucideIcon;
    trailingIcon?: LucideIcon;
    onleading?: () => void;
    ontrailing?: () => void;
    oninput?: (value: number) => void;
    onblur?: (value: number) => void;
    state?: InputState;
};

const defaultValue = 0;

const NumberInput: Component<NumberInputProps> = (props: NumberInputProps) => {
    const [value, setValue] = createSignal(props.value ?? defaultValue);
    const [formattedValue, setFormattedValue] = createSignal(value().toFixed(props.fractionDigits));

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

    createEffect(() => {
        const nextValue = props.value;
        setValue(nextValue ?? defaultValue);
    }, props.value);

    return (
        <div class={clsx(
            "grid items-center min-w-0 grid-cols-1",
            props.disabled ? "text-disabled-content" : "text-surface-content",
            props.class)}>
            <input
                type="number"
                step={props.step ?? 1}
                min={props.min ?? 0}
                placeholder={props.placeholder}
                value={formattedValue()}
                oninput={(e) => {
                    const value = parseFloat(e.target.value);

                    if (isNaN(value)) {
                        return;
                    }

                    setValue(value);
                    props.oninput?.(value);
                }}
                onblur={(e) => {
                    const formatted = value().toFixed(props.fractionDigits);
                    setFormattedValue(formatted);
                    e.target.value = formatted;
                    props.onblur?.(value());
                }}
                class={clsx(
                    "col-start-1 col-end-1 row-start-1 row-end-1 shadow-md focus:shadow-lg rounded-field py-2 h-field",
                    props.disabled ? "bg-disabled" : "bg-surface-200",
                    props.leadingIcon ? "pl-10" : "pl-4",
                    props.trailingIcon ? "pr-10" : "pr-4",
                    stateClass(),
                )}
                classList={{
                    "text-start": props.textAlign === "start",
                    "text-center": props.textAlign === "center",
                    "text-end": props.textAlign === "end",
                }} />

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
};

export default NumberInput;
