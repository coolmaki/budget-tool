import { AmountPerPeriod } from "./types";

export type Budget = {
    id: string;
    name: string;
};

export type Category = {
    id: string;
    name: string;
};

export type Account = {
    id: string;
    name: string;
    total: number;
};

export type Expense = {
    id: string;
    name: string;
    amount: AmountPerPeriod;
    category: { id: string; name: string };
    account: { id: string; name: string };
};
