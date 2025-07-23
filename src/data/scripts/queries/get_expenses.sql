SELECT
    a."id",
    a."name",
    a."amount",
    b."id" AS "category_id",
    b."name" AS "category_name",
    c."id" AS "account_id",
    c."name" AS "account_name"
FROM "expenses" AS a
INNER JOIN "categories" AS b ON a."category_id" = b."id"
INNER JOIN "accounts" AS c ON a."account_id" = c."id"
WHERE
    a."budget_id" = $budgetId
    AND ($search IS NULL OR a."name" LIKE $search)
    AND ($categoryId IS NULL OR $categoryId = a."budget_id")
    AND ($accountId IS NULL OR $accountId = a."account_id")