import clsx from "clsx";
import { JSX } from "solid-js";

export default function LoadingIndicator(props: { class?: string }): JSX.Element {
    return (
        <div class={clsx("spinner-bars text-base-content", props.class)} aria-label="Loading...">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
} 