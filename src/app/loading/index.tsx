import { Accessor, createContext, createMemo, createSignal, JSX, ParentProps, useContext } from "solid-js";

type LoadingContext = {
    loading: Accessor<boolean>;
    loadWhile: <T>(task: () => Promise<T>) => Promise<T>;
};

const LoadingContext = createContext<LoadingContext>();

export function LoadingContextProvider(props: ParentProps): JSX.Element {
    const [loadingCount, setLoadingCount] = createSignal(0);

    const loading = createMemo(() => loadingCount() > 0);

    async function loadWhile<T>(task: () => Promise<T>): Promise<T> {
        setLoadingCount(current => current + 1);
        return await task()
            .finally(() => setLoadingCount(current => current - 1));
    }

    return (
        <LoadingContext.Provider value={{ loading, loadWhile }}>
            {props.children}
        </LoadingContext.Provider>
    );
}

export function useLoading(): LoadingContext {
    const context = useContext(LoadingContext);
    return context!;
}
