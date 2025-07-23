export type Period = {
    type: PeriodType;
    amount: number;
}

export enum PeriodType {
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
    YEAR = "year",
};

export type AmountPerPeriod = {
    day: number;
    week: number;
    month: number;
    year: number;
};
