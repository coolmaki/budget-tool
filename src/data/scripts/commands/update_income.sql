UPDATE "incomes"
SET
    "name" = $name,
    "amount" = $amount,
    "period_type" = $periodType,
    "period_amount" = $periodAmount
WHERE
    "budget_id" = $budgetId
    AND "id" = $id