UPDATE "expenses"
SET
    "account_id" = NULL
WHERE
    "budget_id" = $budgetId
    AND "account_id" = $accountId