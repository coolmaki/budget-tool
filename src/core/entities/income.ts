import type { Period } from "@/core/types";

export type Income = {
    budgetId: string;
    id: string;
    name: string;
    period: Period;
    amount: number;
};
