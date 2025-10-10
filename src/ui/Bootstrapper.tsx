import { StackRenderer, useNavigation } from "@/app/navigation";
import Budgets from "@/ui/pages/Budgets";
import { Component, onMount } from "solid-js";

const Bootstrapper: Component = () => {
    const { stack, setRoot } = useNavigation();

    onMount(() => {
        setRoot(Budgets);
    });

    return (
        <StackRenderer stack={stack} />
    );
};

export default Bootstrapper;
