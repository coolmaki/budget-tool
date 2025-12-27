import { useI18n } from "@/app/i18n";
import { Component } from "solid-js";
import Dialog from "../Dialog";

type OkDialogProps = {
    show?: boolean;
    title: string;
    message: string;
    ondismiss: () => void;
};

const OkDialog: Component<OkDialogProps> = (props) => {
    const { t } = useI18n();

    return (
        <Dialog
            show={props.show}
            ondismiss={props.ondismiss}>
            <div class="w-screen p-4">
                <div class="flex flex-col gap-sm bg-surface-100 rounded-surface p-sm">
                    <h1 class="text-xl text-surface-content">{props.title}</h1>
                    <p class="text-sm leading-5 text-surface-content whitespace-pre-line">{props.message}</p>

                    <div class="flex flex-row justify-end gap-sm">
                        {/* Ok */}
                        <button
                            type="button"
                            class="button bg-neutral text-neutral-content"
                            onclick={props.ondismiss}>
                            {t("Dialogs.Ok.Ok")}
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default OkDialog;