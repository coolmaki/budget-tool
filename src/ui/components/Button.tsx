import clsx from "clsx";
import { LucideIcon } from "lucide-solid";
import { createMemo, JSX, Show } from "solid-js";

type Size = "md" | "lg";
type Style =
    | "primary"
    | "secondary"
    | "accent"
    | "neutral"
    | "info"
    | "success"
    | "warning"
    | "error";

type ButtonProps = {
    icon?: LucideIcon;
    text?: string;
    size?: Size;
    style?: Style;
    class?: string;
    onclick?: () => void;
};

function getSizeValue(size: Size): number {
    switch (size) {
        case "md": return 16;
        case "lg": return 20;
    }
}

function getSizeClasses(size: Size): string {
    switch (size) {
        case "md": return "h-10 text-md gap-2 px-4";
        case "lg": return "h-12 text-lg gap-2 px-4";
    }
}

function getStyleClasses(style: Style): string {
    switch (style) {
        case "primary": return "bg-primary text-primary-content";
        case "secondary": return "bg-secondary text-secondary-content";
        case "accent": return "bg-accent text-accent-content";
        case "neutral": return "bg-neutral text-neutral-content";
        case "info": return "bg-info text-info-content";
        case "success": return "bg-success text-success-content";
        case "warning": return "bg-warning text-warning-content";
        case "error": return "bg-error text-error-content";
    }
}

type ButtonStyling = {
    iconSize: number;
    sizeClasses: string;
    styleClasses: string;
};

export default function Button(props: ButtonProps): JSX.Element {

    const style = createMemo<ButtonStyling>(() => ({
        iconSize: getSizeValue(props.size ?? "md"),
        sizeClasses: getSizeClasses(props.size ?? "md"),
        styleClasses: getStyleClasses(props.style ?? "primary"),
    }));

    return (
        <button
            onclick={props.onclick}
            class={clsx(
                "flex flex-row flex-nowrap items-center rounded-surface cursor-pointer shadow-md hover:opacity-90 hover:shadow-none transition-all",
                style().sizeClasses,
                style().styleClasses,
                props.class)}>
            <Show when={props.icon}>
                {(result) => {
                    const Icon = result();
                    return <Icon size={style().iconSize} />
                }}
            </Show>
            <span>{props.text}</span>
        </button>
    );
}