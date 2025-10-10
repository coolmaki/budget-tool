UPDATE "expenses"
SET
    "category_id" = NULL
WHERE
    "budget_id" = $budgetId
    AND "category_id" = $categoryId