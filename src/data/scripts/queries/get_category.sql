SELECT
    A."budget_id",
    A."id",
    A."name",
    A."color"
FROM "categories" AS A
WHERE
    A."budget_id" = $budgetId
    AND A."id" = $id