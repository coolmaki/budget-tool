DELETE
FROM "accounts"
WHERE
    "budget_id" = $budgetId
    AND "id" = $id