import Dialog from "@/ui/components/Dialog";
import { CheckIcon, XIcon } from "lucide-solid";
import { ParentComponent } from "solid-js";

type FormDialogProps = {
    show?: boolean;
    title: string;
    onsave: () => void;
    oncancel?: () => void;
};

const FormDialog: ParentComponent<FormDialogProps> = (props) => {
    return (
        <Dialog
            show={props.show}
            ondismiss={() => props.oncancel?.()}>
            <div class="w-screen p-sm">
                <div
                    class="flex flex-col gap-sm rounded-surface bg-surface-100 p-sm">
                    <div class="flex flex-row gap-xs items-center">
                        <span class="text-xl text-surface-content flex-1">{props.title}</span>
                        <button
                            class="shrink-0 button-icon-field bg-neutral text-neutral-content"
                            onclick={() => props.oncancel?.()}>
                            <XIcon />
                        </button>
                        <button
                            class="shrink-0 button-icon-field bg-neutral text-neutral-content"
                            onclick={props.onsave}>
                            <CheckIcon />
                        </button>
                    </div>

                    <hr class="text-border"></hr>

                    {props.children}
                </div>
            </div>
        </Dialog>
    );
};

export default FormDialog;