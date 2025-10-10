SELECT
    a."budget_id",
    a."id",
    a."name",
    a."category_id",
    a."account_id",
    a."period_type",
    a."period_amount",
    a."amount"
FROM "expenses" AS a
WHERE
    a."budget_id" = $budgetId
    AND a."id" = $id