import { Account, Category } from "@/core/models";
import { createContext, ParentComponent, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

export type ExpenseFilter = {
    search?: string;
    category?: Category;
    account?: Account;
};

type ExpenseFilterContext = [ExpenseFilter, SetStoreFunction<ExpenseFilter>];

const ExpenseFilterContext = createContext<ExpenseFilterContext>();

export const ExpenseFilterContextProvider: ParentComponent = (props) => {
    const context = createStore<ExpenseFilter>({});

    return (
        <ExpenseFilterContext.Provider value={context}>
            {props.children}
        </ExpenseFilterContext.Provider>
    );
};

export function useExpenseFilter(): ExpenseFilterContext {
    const context = useContext(ExpenseFilterContext);
    return context!;
}
