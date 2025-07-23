const dict = {
    Global: {
        Errors: {
            Unhandled: "An unhandled error has occured.",
        },
    },
    BudgetsPage: {
        Title: "Budgets",
        NewBudget: "New Budget",
        YouHaveNoBudgets: "You have no budgets",
    },
    SettingsPage: {
        Title: "Settings",
        Sections: {
            Appearance: {
                Title: "Appearance",
                Themes: {
                    System: "System",
                    Light: "Light",
                    Dark: "Dark",
                },
            },
            Data: {
                Title: "Data",
                ClearData: "Clear Data",
            },
        },
        Errors: {
            BudgetNameAlreadyUsed: (name: string) => `The budget name ${name} has already been used.`,
        },
    },
};

export { dict };

