UPDATE "categories"
SET "name" = $name
WHERE
    "budget_id" = $budgetId
    AND "id" = $id