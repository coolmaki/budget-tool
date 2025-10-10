DELETE
FROM "categories"
WHERE
    "budget_id" = $budgetId
    AND "id" = $id