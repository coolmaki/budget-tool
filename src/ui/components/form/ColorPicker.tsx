import Dialog from "@/ui/components/Dialog";
import { PipetteIcon, XIcon } from "lucide-solid";
import { Component, createMemo, createSignal, For } from "solid-js";

type ColorPickerProps = {
    title: string;
    value?: string;
    onchange?: (value: string) => void;
};

const colors = [
    "#F8B195", // soft peach
    "#F67280", // coral pink
    "#C06C84", // dusty mauve
    "#E0BBE4", // lavender
    "#A8E6CF", // mint
    "#9DE3D0", // aqua mint
    "#99C1DE", // pastel blue
    "#77B6EA", // stronger sky blue
    "#A8E6A3", // pastel green
    "#B5EAD7", // light green-teal
    "#FFDAC1", // pale peach
    "#FFB7B2", // soft pink
    "#F3C1C6", // rose
    "#F6EAC2", // light cream
    "#FFF5BA", // butter yellow
    "#D5E1DF", // fog gray
];

const ColorPicker: Component<ColorPickerProps> = (props) => {
    const [showPicker, setShowPicker] = createSignal(false);

    const textColor = createMemo(() => {
        if (props.value === undefined) {
            return undefined;
        }

        // Simple luminance check — returns either a dark or light text color
        const hex = props.value.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        return luminance > 0.7 ? "#333333" : "#F8F8F8";
    });

    return (
        <>
            <button
                type="button"
                class="button button-border button-leading-icon bg-surface-200 text-surface-content"
                style={{ background: props.value, color: textColor() }}
                onclick={() => setShowPicker(true)}>
                <PipetteIcon />
            </button>

            <Dialog
                show={showPicker()}
                ondismiss={() => setShowPicker(false)}>
                <div class="w-screen p-sm">
                    <div
                        class="flex flex-col gap-sm rounded-surface bg-surface-100 p-sm">
                        <div class="flex flex-row gap-xs items-center">
                            <span class="text-xl text-surface-content flex-1">{props.title}</span>
                            <button
                                class="shrink-0 button-icon-field bg-neutral"
                                classList={{ "text-neutral-content": props.value === undefined }}
                                onclick={() => setShowPicker(false)}>
                                <XIcon />
                            </button>
                        </div>

                        <hr class="text-border"></hr>

                        <div class="flex flex-row flex-wrap gap-sm justify-center">
                            <For each={colors}>
                                {
                                    (color) => (
                                        <button
                                            class="shrink-0 button-icon-field"
                                            style={{ background: color }}
                                            onclick={() => { props.onchange?.(color); setShowPicker(false); }}> </button>
                                    )
                                }
                            </For>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default ColorPicker;
