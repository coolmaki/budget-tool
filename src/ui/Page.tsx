import { useNavigation } from "@/app/navigation";
import clsx from "clsx";
import { ArrowLeftIcon, MenuIcon } from "lucide-solid";
import { ParentComponent, Show } from "solid-js";
import IconButton from "./components/IconButton";

type PageProps = {
    title?: string;
    class?: string;
    isRoot?: boolean;
};

const Page: ParentComponent<PageProps> = (props) => {
    const { pop, setIsOpen } = useNavigation();

    return (
        <div
            class={clsx(
                "w-screen h-screen flex flex-col bg-base-200",
                props.class,
            )}>
            <Show when={props.title}>
                {(title) => (
                    <header class="shrink-0 flex flex-row items-center gap-4 p-4">
                        <Show
                            when={props.isRoot === true}
                            fallback={(
                                <IconButton
                                    icon={ArrowLeftIcon}
                                    color="base-100"
                                    size="md"
                                    onselected={() => pop()}
                                    class="shrink-0" />
                            )}>
                            <IconButton
                                icon={MenuIcon}
                                color="base-100"
                                size="md"
                                onselected={() => setIsOpen(true)}
                                class="shrink-0" />
                        </Show>
                        <h1 class="flex-1 text-base-content text-2xl">{title()}</h1>
                    </header>
                )}
            </Show>
            {props.children}
        </div>
    );
};

export default Page;
