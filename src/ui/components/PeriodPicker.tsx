import { useI18n } from "@/app/i18n";
import { Period, PeriodType } from "@/core/types";
import Dropdown from "@/ui/components/form/Dropdown";
import NumberInput from "@/ui/components/form/NumberInput";
import clsx from "clsx";
import { Component } from "solid-js";
import { createStore } from "solid-js/store";

type PeriodPickerProps = {
    class?: string;
    value?: Period;
    onamountchanged?: (amount: number) => void;
    ontypechanged?: (type: PeriodType) => void;
};

const PeriodPicker: Component<PeriodPickerProps> = (props) => {
    const { t } = useI18n();

    const [state, setState] = createStore<Period>(props.value ?? { type: PeriodType.WEEK, amount: 1 });

    function setAmount(amount: number): void {
        setState("amount", amount);
        props.onamountchanged?.(amount);
    }

    function setType(type: PeriodType): void {
        setState("type", type);
        props.ontypechanged?.(type);
    }

    return (
        <div class={clsx(
            "flex flex-row gap-sm items-center",
            props.class)}>
            <span class="text-lg text-surface-content">
                {t("Global.Words.Every")}
            </span>

            {/* Period Amount */}
            <NumberInput
                class="flex-1"
                value={state.amount}
                placeholder="1"
                min={1}
                step={1}
                fractionDigits={0}
                textAlign="center"
                state={isNaN(state.amount) ? "invalid" : "none"}
                onblur={(value) => setAmount(value)} />

            {/* Period Type */}
            <Dropdown
                items={[PeriodType.DAY, PeriodType.WEEK, PeriodType.MONTH, PeriodType.YEAR]}
                value={state.type}
                getName={(value) => t("Core.PeriodType", { periodType: value!, plural: state.amount > 1 })!}
                areEqual={(a, b) => a === b}
                onselected={(value) => setType(value)} />
        </div>
    );
};

export default PeriodPicker;
