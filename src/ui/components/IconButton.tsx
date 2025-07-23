import { getSurfaceColor, getTextColor, ThemeColor } from "@/app/themes";
import clsx from "clsx";
import { LucideIcon } from "lucide-solid";
import { Component } from "solid-js";

type Size = "md" | "lg";

type IconButtonProps = {
    icon: LucideIcon;
    onselected?: () => void;
    class?: string;
    size?: Size;
    color: ThemeColor;
};

const IconButton: Component<IconButtonProps> = (props) => {
    const size = () => {
        switch (props.size) {
            case "md": return 24;
            case "lg": return 24;
            default: return undefined;
        }
    }

    return (
        <button
            class={clsx(
                "select-none cursor-pointer flex flex-col justify-center items-center hover:shadow-sm transition-all",
                props.class,
                getSurfaceColor(props.color),
                getTextColor(props.color),
            )}
            classList={{
                "w-12 h-12 rounded-[1.5rem]": props.size === "md" || props.size === undefined,
                "w-16 h-16 rounded-[2rem]": props.size === "lg",
            }}
            onclick={props.onselected}>
            <props.icon size={size()} />
        </button>
    );
};

export default IconButton;
