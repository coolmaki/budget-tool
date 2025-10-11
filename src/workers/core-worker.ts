import { createLogger } from "@/app/logging";
import { createCore } from "@/core";
import { AuditScriptManager } from "@/data/audits";
import { CommandScriptManager, createCommandRepository } from "@/data/commands";
import { runMigrations } from "@/data/migrations";
import { createQueryRepository, QueryScriptManager } from "@/data/queries";
import type { Database } from "@sqlite.org/sqlite-wasm";
import { expose } from "comlink";

// ------------------------------------------------------------
// Disposables
// ------------------------------------------------------------

let database: Database | undefined;

// ------------------------------------------------------------
// Logging
// ------------------------------------------------------------

const logger = createLogger();
logger.debug("Starting...");

// ------------------------------------------------------------
// Process
// ------------------------------------------------------------

async function start(): Promise<void> {

    // ------------------------------------------------------------
    // Data
    // ------------------------------------------------------------

    const coreDataPath = "core.db";

    const { getDatabase } = await import("@/data/sqlite");

    async function initializeDatabase(): Promise<void> {
        database = await getDatabase({ path: `/${coreDataPath}`, logger })
            .catch((error) => {
                logger.error("Failed to initialize database", error);
                return undefined;
            });
    }

    await initializeDatabase();

    if (!database) {
        logger.error("Failed to initialize database");
        self.close();
        return;
    }

    await runMigrations(database);

    await AuditScriptManager.initialize();
    await CommandScriptManager.initialize();
    await QueryScriptManager.initialize();

    const commandRepository = createCommandRepository(() => database!);
    const queryRepository = createQueryRepository(() => database!);

    // ------------------------------------------------------------
    // Core
    // ------------------------------------------------------------

    function disconnect(): Promise<void> {
        database?.close();
        database = undefined;
        return Promise.resolve();
    }

    async function clearData(): Promise<void> {
        database?.close();

        const directory = await navigator.storage.getDirectory();
        await directory.removeEntry(coreDataPath);
        await initializeDatabase();

        if (!database) {
            logger.error("Failed to initialize database");
            self.close();
            return;
        }

        await runMigrations(database);
    }

    const core = createCore({
        logger,
        commandRepository: commandRepository,
        queryRepository: queryRepository,
        disconnect: disconnect,
        clearData: clearData,
    });

    // ------------------------------------------------------------
    // Ready
    // ------------------------------------------------------------

    postMessage("ready");

    // ------------------------------------------------------------
    // Expose
    // ------------------------------------------------------------

    expose(core);
}

start().catch((error) => {
    logger.error(error);
    database?.close();
});
