import { AmountPerPeriod, Period, PeriodType } from "@/core/types";

function getPeriodsPerYear(type: PeriodType): number {
    switch (type) {
        case PeriodType.DAY: return 365;
        case PeriodType.WEEK: return 52;
        case PeriodType.MONTH: return 12;
        case PeriodType.YEAR: return 1;
        default: throw new RangeError(`${type} is not a valid PeriodType`);
    }
}

export function convertPeriod({ amount, currentPeriod, targetPeriod }: { amount: number, currentPeriod: Period, targetPeriod: Period }): number {
    const yearly = (amount / currentPeriod.amount) * getPeriodsPerYear(currentPeriod.type);
    const converted = (yearly / getPeriodsPerYear(targetPeriod.type)) * targetPeriod.amount;
    return converted;
}

const normalizedPeriod: Period = {
    type: PeriodType.YEAR,
    amount: 1,
};

export function amountFromNormalized(amount: number): AmountPerPeriod {
    return {
        day: convertPeriod({ amount: amount, currentPeriod: normalizedPeriod, targetPeriod: { type: PeriodType.DAY, amount: 1 } }),
        week: convertPeriod({ amount: amount, currentPeriod: normalizedPeriod, targetPeriod: { type: PeriodType.WEEK, amount: 1 } }),
        month: convertPeriod({ amount: amount, currentPeriod: normalizedPeriod, targetPeriod: { type: PeriodType.MONTH, amount: 1 } }),
        year: convertPeriod({ amount: amount, currentPeriod: normalizedPeriod, targetPeriod: { type: PeriodType.YEAR, amount: 1 } }),
    };
}

export function amountToNormalized(amount: number, period: Period): number {
    return convertPeriod({ amount: amount, currentPeriod: period, targetPeriod: normalizedPeriod });
}