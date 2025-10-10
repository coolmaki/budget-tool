import { Component } from "solid-js";
import Dialog from "@/ui/components/Dialog";
import { InfoIcon, XIcon } from "lucide-solid";

type InformationDialogProps = {
    show?: boolean;
    title: string;
    text: string;
    ondismiss?: () => void;
};

const InformationDialog: Component<InformationDialogProps> = (props) => {
    return (
        <Dialog
            show={props.show}
            ondismiss={props.ondismiss}>
            <div class="w-screen p-4">
                <div class="flex flex-col gap-sm bg-surface-100 rounded-surface p-sm">
                    <h1 class="flex flex-row gap-xs items-center text-surface-content">
                        <InfoIcon />
                        <span class="text-xl text-surface-content flex-1">{props.title}</span>
                        <button
                            type="button"
                            class="shrink-0 button-icon-field bg-neutral"
                            onclick={() => props.ondismiss?.()}>
                            <XIcon />
                        </button>
                    </h1>
                    <p class="text-md leading-5 text-surface-content">{props.text}</p>
                </div>
            </div>
        </Dialog>
    );
};

export default InformationDialog;