DELETE
FROM "incomes"
WHERE
    "budget_id" = $budgetId
    AND "id" = $id