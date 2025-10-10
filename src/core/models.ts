import type { Period } from "@/core/types";

export type Budget = {
    id: string;
    name: string;
};

export type Income = {
    id: string;
    name: string;
    period: Period;
    amount: number;
};

export type Account = {
    id: string;
    name: string;
    total: number;
};

export type Category = {
    id: string;
    name: string;
    color: string;
    total: number;
};

export type Expense = {
    id: string;
    name: string;
    period: Period;
    amount: number;
    category: { id: string; name: string };
    account: { id: string; name: string };
};
