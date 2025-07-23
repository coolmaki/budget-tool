CREATE TABLE "__migrations" (
    "version" INTEGER PRIMARY KEY,
    "script" TEXT NOT NULL UNIQUE
);

CREATE TABLE "audits" (
    "id" TEXT PRIMARY KEY,
    "command" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL
);

CREATE TABLE "budgets" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "categories" (
    "budget_id" TEXT NOT NULL,
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    FOREIGN KEY ("budget_id") REFERENCES "budgets" ("id")
);

CREATE TABLE "accounts" (
    "budget_id" TEXT NOT NULL,
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    FOREIGN KEY ("budget_id") REFERENCES "budgets" ("id")
);

CREATE TABLE "expenses" (
    "budget_id" TEXT NOT NULL,
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    FOREIGN KEY ("budget_id") REFERENCES "budgets" ("id"),
    FOREIGN KEY ("category_id") REFERENCES "categories" ("id"),
    FOREIGN KEY ("account_id") REFERENCES "accounts" ("id")
);
