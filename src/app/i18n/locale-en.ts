import type { Theme } from "@/app/themes";
import { Period, PeriodType } from "@/core/types";

function periodTypeText({ periodType, plural }: { periodType: PeriodType, plural: boolean }): string {
    switch (periodType) {
        case "day": return plural ? "Days" : "Day";
        case "week": return plural ? "Weeks" : "Week";
        case "month": return plural ? "Months" : "Month";
        case "year": return plural ? "Years" : "Year";
        default: return "";
    }
}

function formatCurrency(amount: number): string {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const dict = {
    AppName: "Budget Tool",
    Global: {
        Words: {
            Every: "Every",
        },
        Placeholders: {
            Search: "Search",
        },
        Errors: {
            Unhandled: "An unhandled error has occured.",
        },
    },
    Core: {
        Total: "Total:",
        CurrencyFormat: formatCurrency,
        PeriodType: periodTypeText,
        AmountOverPeriod: (period: Period) => `every ${period.amount > 1 ? period.amount + " " : ""}${periodTypeText({ periodType: period.type, plural: period.amount > 1 }).toLowerCase()}`,
    },
    Dialogs: {
        Confirm: {
            Cancel: "Cancel",
            Confirm: "Confirm",
        },
    },
    Errors: {
        BudgetNameAlreadyUsed: (name: string) => `The budget name ${name} has already been used.`,
        IncomeNotFound: "The income you are trying to edit is not found.",
    },
    BudgetsPage: {
        Title: "Budgets",
        SearchBudget: "Search budget",
        BudgetNamePlaceholder: "Budget Name",
        AddNewBudget: "Add new budget",
        EditBudget: "Edit budget",
        YouHaveNoBudgets: "You have no budgets",
        DeleteBudgetTitle: "Delete Budget",
        DeleteBudgetMessage: (budgetName: string) => `Are you sure you want to delete "${budgetName}"?`,
    },
    SettingsPage: {
        Title: "Settings",
        Sections: {
            Appearance: {
                Title: "Appearance",
                Themes: (theme: Theme) => {
                    switch (theme) {
                        case "system": return "System";
                        case "light": return "Light";
                        case "dark": return "Dark";
                        default: return "";
                    }
                },
            },
            Updates: {
                Title: "Updates",
                UpdateAvailable: "Update Available",
                NoUpdateAvailable: "No Update Available",
                UpdateError: "Update Error",
            },
            Data: {
                Title: "Data",
                ImportData: "Import Data",
                ImportDataConfirmationTitle: "Import Data",
                ImportDataConfirmationMessage: "This will override your current data (make sure to backup your data first).\n\nAre you sure you want to proceed?",
                ExportData: "Export Data",
                ClearData: "Clear Data",
                ClearDataConfirmationTitle: "Clear Data",
                ClearDataConfirmationMessage: "This will permanently delete your data (make sure to backup your data first).\n\nAre you sure you want to proceed?",
            },
        },
    },
    ManagePage: {
        Title: "Manage",
        Information: "TODO: Put some information about the Manage page here...",
        View: "View",
        ViewChartBy: "View chart by:",
        DataViewType: (type: string) => {
            switch (type) {
                case "dollar": return "Dollar";
                case "percentage": return "Percentage";
                default: return "Unknown";
            }
        },
        ShowAmountsFor: "Show amounts for",
        YouHaveNoIncome: "You have no incomes",
    },
    IncomePage: {
        Title: "Income",
        Information: "TODO: Put some information about the Income page here...",
        SearchIncomes: "Search income",
        IncomeNamePlaceholder: "Income Name",
        AddNewIncome: "Add new income",
        EditIncome: "Edit income",
        YouHaveNoIncome: "You have no incomes",
        DeleteIncomeTitle: "Delete Income",
        DeleteIncomeMessage: (incomeName: string) => `Are you sure you want to delete "${incomeName}"?`,
    },
    AccountsPage: {
        Title: "Accounts",
        Information: "TODO: Put some information about the Accounts page here...",
        SearchAccounts: "Search accounts",
        AccountNamePlaceholder: "Account Name",
        AddNewAccount: "Add new account",
        EditAccount: "Edit account",
        YouHaveNoAccounts: "You have no accounts",
        DeleteAccountTitle: "Delete Account",
        DeleteAccountMessage: (accountName: string) => `Are you sure you want to delete "${accountName}"?`,
    },
    CategoriesPage: {
        Title: "Categories",
        Information: "TODO: Put some information about the Categories page here...",
        SearchCategories: "Search categories",
        CategoryNamePlaceholder: "Category Name",
        AddNewCategory: "Add new category",
        EditCategory: "Edit category",
        YouHaveNoCategories: "You have no categories",
        DeleteCategoryTitle: "Delete Category",
        DeleteCategoryMessage: (categoryName: string) => `Are you sure you want to delete "${categoryName}"?`,
    },
    ExpensesPage: {
        Title: "Expenses",
        Information: "TODO: Put some information about the Expenses page here...",
        SearchExpenses: "Search expenses",
        ExpenseNamePlaceholder: "Expense Name",
        AddNewExpense: "Add new expense",
        EditExpense: "Edit expense",
        YouHaveNoExpenses: "You have no expenses",
        DeleteExpenseTitle: "Delete Expense",
        DeleteExpenseMessage: (expenseName: string) => `Are you sure you want to delete "${expenseName}"?`,
        SelectCategory: "Select category",
        SelectAccount: "Select account",
    },
};

export { dict };

