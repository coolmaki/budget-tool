import clsx from "clsx";
import { JSX, ParentProps } from "solid-js";

type ScrollViewProps = {
    orientation: "vertical" | "horizontal";
    class?: string;
};

export default function ScrollView(props: ParentProps<ScrollViewProps>): JSX.Element {
    return (
        <div
            class={clsx("scrollable", props.class)}
            classList={{
                "overflow-y-auto": props.orientation === "vertical",
                "overflow-x-auto": props.orientation === "horizontal",
            }}>
            {props.children}
        </div>
    );
}