import { delay } from "@/utils/promises";
import { Accessor, Component, createContext, createSignal, For, ParentComponent, Setter, useContext } from "solid-js";
import { createStore } from "solid-js/store";

const animationDuration = 500;

type Stack = {
    current: number;
    value: Component[];
};

type NavigationContext = {
    stack: Stack;
    setRoot: (view: Component) => void;
    push: (view: Component) => void;
    pop: () => void;
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
};

const NavigationContext = createContext<NavigationContext>();

export const NavigationContextProvider: ParentComponent = (props) => {
    const [stack, setStack] = createStore<Stack>({
        current: -1,
        value: [],
    });

    const [isOpen, setIsOpen] = createSignal(true);

    async function push(view: Component): Promise<void> {
        setIsOpen(false);
        setStack("value", value => [...value, view]);
        await delay();
        setStack("current", current => current + 1);
        await delay(animationDuration);
    }

    async function pop(): Promise<void> {
        const canPop = stack.value.length > 1;
        if (!canPop) {
            return;
        }

        setIsOpen(false);

        setStack("current", current => current - 1);

        await delay(animationDuration);

        setStack("value", value => value.slice(0, -1));
    }

    function setRoot(view: Component): void {
        setIsOpen(false);
        setStack({
            current: 0,
            value: [view],
        });
    }

    const context: NavigationContext = {
        stack,
        setRoot,
        push,
        pop,
        isOpen,
        setIsOpen,
    };

    return (
        <NavigationContext.Provider value={context}>
            {props.children}
        </NavigationContext.Provider>
    );
};

export function useNavigation(): NavigationContext {
    const context = useContext(NavigationContext)!;
    return context;
}

type StackRendererProps = {
    stack: Stack;
};

export const StackRenderer: Component<StackRendererProps> = (props) => {
    return (
        <div class="fixed inset-0 bg-black">
            <For each={props.stack.value}>
                {(View, i) => (
                    <ViewRenderer
                        viewIndex={i()}
                        stackIndex={props.stack.current}>
                        <View />
                    </ViewRenderer>
                )}
            </For>
        </div>
    );
};

type ViewRendererProps = {
    viewIndex: number;
    stackIndex: number;
};

const ViewRenderer: ParentComponent<ViewRendererProps> = (props) => {
    return (
        <div
            class="absolute inset-0 bg-base-200 transition-all duration-[500ms] ease-in-out"
            classList={{
                "-z-10 -translate-x-1/2 -translate-y-1/12 rounded-surface": props.viewIndex < props.stackIndex,
                "z-0": props.viewIndex === props.stackIndex,
                "z-10 translate-x-full -translate-y-1/12 rounded-surface": props.viewIndex > props.stackIndex,
            }}>
            {props.children}
        </div >
    );
};
