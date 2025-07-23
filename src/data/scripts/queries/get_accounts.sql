WITH "account_totals" AS (
    SELECT
        "account_id" AS "id",
        SUM("amount") AS "total"
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
WHERE A."budget_id" = $budgetId