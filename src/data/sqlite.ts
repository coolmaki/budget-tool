import type { Logger } from "@/app/logging";
import initializeSqlite, { type Database, type Sqlite3Static } from "@sqlite.org/sqlite-wasm";

export type SqliteOptions = {
    path: string;
    logger: Logger;
};

type SqliteOptionsWithModule = SqliteOptions & { sqlite: Sqlite3Static };

export async function getDatabase(options: SqliteOptions): Promise<Database> {
    const { logger } = options;

    logger.debug("Loading and initializing SQLite3 module...");

    const sqlite = await initializeSqlite({ print: logger.info, printErr: logger.error });
    const database = createDatabase({ ...options, sqlite });

    return database;
};

function createDatabase(options: SqliteOptionsWithModule): Database {
    const { logger, sqlite } = options;

    logger.debug("Running SQLite3 version", sqlite.version.libVersion);

    const db = "opfs" in options.sqlite ?
        createOpfsDatabase(options) :
        createTransientDatabase(options);

    return db;
};

function createOpfsDatabase({ path, logger, sqlite }: SqliteOptionsWithModule): Database {
    const db = new sqlite.oo1.OpfsDb(path);
    logger.info(`OPFS is available, created persisted database at ${path}`);
    return db;
}

function createTransientDatabase({ path, logger, sqlite }: SqliteOptionsWithModule): Database {
    const db = new sqlite.oo1.DB(path);
    logger.warn(`OPFS is not available, created transient database ${path}`);
    return db;
}
