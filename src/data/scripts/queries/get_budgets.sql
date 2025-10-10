SELECT
    "id",
    "name"
FROM "budgets"
WHERE "name" LIKE CONCAT('%', $search, '%')