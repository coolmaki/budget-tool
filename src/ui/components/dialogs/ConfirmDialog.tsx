import { useI18n } from "@/app/i18n";
import { Component } from "solid-js";
import Dialog from "../Dialog";

type ConfirmDialogProps = {
    show?: boolean;
    title: string;
    message: string;
    onconfirm: () => void;
    oncancel?: () => void;
};

const ConfirmDialog: Component<ConfirmDialogProps> = (props) => {
    const { t } = useI18n();

    return (
        <Dialog
            show={props.show}
            ondismiss={props.oncancel}>
            <div class="w-screen p-4">
                <div class="flex flex-col gap-sm bg-surface-100 rounded-surface p-sm">
                    <h1 class="text-xl text-surface-content">{props.title}</h1>
                    <p class="text-sm leading-5 text-surface-content whitespace-pre-line">{props.message}</p>

                    <div class="flex flex-row justify-end gap-sm">
                        {/* Cancel */}
                        <button
                            type="button"
                            class="button bg-neutral text-neutral-content"
                            onclick={props.oncancel}>
                            {t("Dialogs.Confirm.Cancel")}
                        </button>

                        {/* Confirm */}
                        <button
                            type="button"
                            class="button bg-error text-error-content"
                            onclick={props.onconfirm}>
                            {t("Dialogs.Confirm.Confirm")}
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default ConfirmDialog;