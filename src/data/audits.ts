import type { AuditRepository } from "@/core/repositories";
import { generateId } from "@/utils/id";
import { getTimestap as getTimestamp } from "@/utils/timestamp";
import type { Database } from "@sqlite.org/sqlite-wasm";

enum AuditScripts {
    log,
};

export class AuditScriptManager {
    private static readonly _scripts: { [path: string]: string } = {};

    public static async initialize(): Promise<void> {
        const globs = import.meta.glob<string>("/src/data/scripts/audits/*.sql", { query: "?raw", import: "default" });

        const scriptLoaders = Object
            .keys(globs)
            .map(key => ({ path: key, load: globs[key] }));

        for (let i = 0; i < scriptLoaders.length; i++) {
            const loader = scriptLoaders[i];
            this._scripts[loader.path] = await loader.load();
        }
    }

    public static load(script: AuditScripts): string {
        const name = `${AuditScripts[script]}.sql`;

        const key = Object
            .keys(this._scripts)
            .find(key => key.endsWith(name));

        if (!key) {
            throw new Error(`No such audit helper ${name}`);
        }

        return this._scripts[key];
    }
}

export function createAuditRepository(db: Database): AuditRepository {
    return {
        log: (audit: { command: string, data: any }): void => {
            const sql = AuditScriptManager.load(AuditScripts.log);

            const params = {
                $id: generateId(),
                $command: audit.command.replaceAll(/[A-Z]/g, "_$1").toUpperCase(),
                $data: JSON.stringify(audit.data),
                $timestamp: getTimestamp(),
            };

            db.exec({ sql: sql, bind: params });
        },
    }
}
