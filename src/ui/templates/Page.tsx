import { useLogging } from "@/app/logging";
import { useNavigation, usePageContext } from "@/app/navigation";
import clsx from "clsx";
import { LucideIcon } from "lucide-solid";
import { Component, createEffect, createMemo, ParentComponent, Show, untrack } from "solid-js";

type PageProps = {
    title: string;
    leadingIcon?: LucideIcon;
    leadingAction?: () => void;
    trailingIcon?: LucideIcon;
    trailingAction?: () => void;
    onappearing?: () => void;
    ondisappearing?: () => void;
    class?: string;
};

const Page: ParentComponent<PageProps> = (props) => {
    const logger = useLogging();
    const { stack } = useNavigation();
    const { index } = usePageContext();

    const isActive = createMemo(() => index === stack.index);

    createEffect(() => {
        if (isActive()) {
            logger.debug(`${untrack(() => props.title)} - appearing...`);
            untrack(() => props.onappearing?.());
        }
        else {
            logger.debug(`${untrack(() => props.title)} - disappearing...`);
            untrack(() => props.ondisappearing?.());
        }
    });

    return (
        <div
            class={clsx(
                "w-screen h-screen flex flex-col bg-surface-100",
                props.class,
            )}>

            <header class="flex flex-row items-start bg-surface-200">

                <Show when={props.leadingIcon}>
                    {(icon) => <HeaderButton icon={icon()} onselected={props.leadingAction} />}
                </Show>

                <h1
                    class="flex-1 flex flex-row items-center text-surface-content text-2xl h-16"
                    classList={{
                        "pl-sm": !props.leadingIcon,
                        "pr-sm": !props.trailingIcon,
                    }}>
                    {props.title}
                </h1>

                <Show when={props.trailingIcon}>
                    {(icon) => <HeaderButton icon={icon()} onselected={props.trailingAction} />}
                </Show>
            </header>

            {props.children}
        </div>
    );
};

export default Page;

type HeaderButtonProps = {
    icon: LucideIcon;
    onselected?: () => void;
};

const HeaderButton: Component<HeaderButtonProps> = (props) => {
    return (
        <button
            type="button"
            class="button-icon shrink-0 text-surface-content"
            onclick={props.onselected}>
            <props.icon />
        </button>
    );
};