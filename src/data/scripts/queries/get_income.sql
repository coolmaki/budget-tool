SELECT
    A."budget_id",
    A."id",
    A."name",
    A."period_type",
    A."period_amount",
    A."amount"
FROM "incomes" AS A
WHERE
    A."budget_id" = $budgetId
    AND A."id" = $id