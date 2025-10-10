SELECT
    COALESCE(
        SUM(
            CASE
                WHEN a."period_type" = 'day' THEN a."amount" / a."period_amount" * 365
                WHEN a."period_type" = 'week' THEN a."amount" / a."period_amount" * 52
                WHEN a."period_type" = 'month' THEN a."amount" / a."period_amount" * 12
                WHEN a."period_type" = 'year' THEN a."amount" / a."period_amount"
                ELSE 0
            END
        ), 0
    )
FROM "incomes" AS a
WHERE a."budget_id" = $budgetId