SELECT
    A."budget_id",
    A."id",
    A."name"
FROM "accounts" AS A
WHERE
    A."budget_id" = $budgetId
    AND A."id" = $id