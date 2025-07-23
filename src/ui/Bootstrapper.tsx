import { StackRenderer, useNavigation } from "@/app/navigation";
import NavMenu from "@/ui/components/NavMenu";
import { Component } from "solid-js";

const Bootstrapper: Component = () => {
    const { stack } = useNavigation();

    // onMount(() => {
    //     setRoot(Dashboard);
    // });

    return (
        <>
            <StackRenderer stack={stack} />
            <NavMenu />
        </>
    );
};

export default Bootstrapper;
