import { useLoading } from "@/app/loading";
import LoadingIndicator from "@/ui/components/LoadingIndicator";
import { JSX, lazy, Suspense } from "solid-js";

type LoaderProps = {
    class?: string;
    fn: () => Promise<{
        default: () => JSX.Element;
    }>,
};

export default function Loader(props: LoaderProps): JSX.Element {
    const { loadWhile } = useLoading();
    const Content = lazy(async () => {
        return await loadWhile(async () => {
            return await props.fn();
        });
    });

    return (
        <Suspense fallback={<LoadingIndicator class={props.class} />}>
            <Content />
        </Suspense>
    );
}
