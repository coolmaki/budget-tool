UPDATE "expenses"
SET
    "name" = $name,
    "category_id" = $categoryId,
    "account_id" = $accountId,
    "amount" = $amount,
    "period_type" = $periodType,
    "period_amount" = $periodAmount
WHERE
    "budget_id" = $budgetId
    AND "id" = $id