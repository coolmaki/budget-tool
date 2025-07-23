import type { Database } from "@sqlite.org/sqlite-wasm";

const _migrationHelperScripts = import.meta.glob<string>("/src/data/scripts/migration-helpers/*.sql", { query: "?raw", import: "default" });

function getMigrationHelperScript(script: MigrationHelperScript): Promise<string> {
    const name = `${MigrationHelperScript[script]}.sql`;

    const key = Object
        .keys(_migrationHelperScripts)
        .find(key => key.endsWith(name));

    if (!key) {
        throw new Error(`No such migration helper ${name}`);
    }

    return _migrationHelperScripts[key]();
}

enum MigrationHelperScript {
    check_migration_table_exists,
    get_latest_migration_version,
    get_migrations,
    insert_migration,
};

export type Migration = {
    version: number;
    script: string;
    sql: () => Promise<string>;
};

function loadMigrations(): Migration[] {
    const scripts = import.meta.glob<string>("/src/data/scripts/migrations/*.sql", { query: "?raw", import: "default" });
    const migrations = Object
        .keys(scripts)
        .toSorted()
        .map((scriptPath, index) => ({
            version: index + 1,
            script: scriptPath.split("/").at(-1)!,
            sql: () => scripts[scriptPath](),
        } satisfies Migration));

    return migrations;
}

export async function getMigrations(db: Database): Promise<string[]> {
    const sql = await getMigrationHelperScript(MigrationHelperScript.get_migrations);
    const migrations = db.selectObjects(sql).map(row => row["script"]!.valueOf() as string)
    return migrations;
}

export async function runMigrations(db: Database): Promise<void> {
    const sql = await getMigrationHelperScript(MigrationHelperScript.check_migration_table_exists);
    const exists = !!(db.selectValue(sql)?.valueOf() as number ?? 0);

    const lastMigrationVersionSql = await getMigrationHelperScript(MigrationHelperScript.get_latest_migration_version);
    const lastMigrationVersion = !exists ?
        0 :
        db.selectObject(lastMigrationVersionSql)!["version"]!.valueOf() as number;

    const migrations = loadMigrations()
        .filter(migration => migration.version > lastMigrationVersion)
        .toSorted((a, b) => a.version = b.version);

    const migrationInsertScript = await getMigrationHelperScript(MigrationHelperScript.insert_migration);

    for (let i = 0; i < migrations.length; i++) {
        const migration = migrations[i];
        const sql = await migration.sql();

        db.transaction(transaction => {
            transaction.exec({ sql });

            const params = {
                $version: migration.version,
                $script: migration.script,
            };

            transaction.exec({
                sql: migrationInsertScript,
                bind: params,
            });
        });
    }
}