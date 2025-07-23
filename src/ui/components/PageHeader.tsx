import { useAppContext } from "@/app";
import LoadingIndicator from "@/ui/components/LoadingIndicator";
import clsx from "clsx";
import { JSX, Show } from "solid-js";

type PageHeaderProps = {
    class?: string;
};

export default function PageHeader(props: PageHeaderProps): JSX.Element {
    const { title, isLoading } = useAppContext();
    return (
        <header class={clsx("bg-neutral text-neutral-content flex flex-row gap-4 h-16 justify-center items-center align-middle rounded-surface shadow-md", props.class)}>
            <h1 class="text-xl">
                <Show
                    when={!isLoading()}
                    fallback={<LoadingIndicator class="bg-neutral text-neutral-content" />}>
                    {title()}
                </Show>
            </h1>
        </header>
    );
}