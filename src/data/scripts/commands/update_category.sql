UPDATE "categories"
SET
    "name" = $name,
    "color" = $color
WHERE
    "budget_id" = $budgetId
    AND "id" = $id