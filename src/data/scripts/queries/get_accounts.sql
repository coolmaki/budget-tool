WITH "account_totals" AS (
    SELECT
        "account_id" AS "id",
        SUM(
            CASE
                WHEN "period_type" = 'day' THEN "amount" / "period_amount" * 365
                WHEN "period_type" = 'week' THEN "amount" / "period_amount" * 52
                WHEN "period_type" = 'month' THEN "amount" / "period_amount" * 12
                WHEN "period_type" = 'year' THEN "amount" / "period_amount"
                ELSE 0
            END
        ) AS "total"
    FROM "expenses"
    WHERE "budget_id" = $budgetId
    GROUP BY "account_id"
)

SELECT
    A."id",
    A."name",
    COALESCE(B."total", 0) AS "total"
FROM "accounts" AS A
LEFT JOIN "account_totals" AS B ON A."id" = B."id"
WHERE
    A."budget_id" = $budgetId
    AND A."name" LIKE CONCAT('%', $search, '%')