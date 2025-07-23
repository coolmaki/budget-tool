INSERT INTO "expenses" (
    "budget_id",
    "id",
    "name",
    "category_id",
    "account_id",
    "amount",
    "period_type",
    "period_amount"
)
VALUES (
    $budgetId,
    $id,
    $name,
    $categoryId,
    $accountId,
    $amount,
    $periodType,
    $periodAmount
)