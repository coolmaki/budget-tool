DELETE
FROM "expenses"
WHERE
    "budget_id" = $budgetId
    AND "id" = $id