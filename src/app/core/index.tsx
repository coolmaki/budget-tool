import { Logger, useLogging } from "@/app/logging";
import { type Core } from "@/core";
import { delay } from "@/utils/promises";
import CoreWorker from "@/workers/core-worker?worker";
import { wrap } from "comlink";
import { createContext, ParentComponent, useContext } from "solid-js";

const defaultInitializationTimeout = 10000;

const CoreContext = createContext<Core>();

export const CoreContextProvider: ParentComponent = (props) => {
    const logger = useLogging();
    const coreWorkerWrapper = new CoreWorkerWrapper({
        logger: logger,
        timeout: defaultInitializationTimeout,
    });

    const coreProxy = new Proxy({} as Core, {
        get: (_, prop: string) => {
            return (...args: any[]) => coreWorkerWrapper
                .getProxy()
                .then((proxy) => {
                    const func = (proxy as any)[prop];
                    if (func === undefined) {
                        throw new Error("Proxy not loaded :(");
                    }

                    return func(...args);
                });
        },
    });

    return (
        <CoreContext.Provider value={coreProxy}>
            {props.children}
        </CoreContext.Provider>
    );
};

export function useCore(): Core {
    const context = useContext(CoreContext);
    return context!;
}

export type CoreWorkerWrapperConfig = {
    logger: Logger;
    timeout: number;
};

class CoreWorkerWrapper {
    private readonly config: CoreWorkerWrapperConfig;
    private proxy: Core | null;

    public constructor(config: CoreWorkerWrapperConfig) {
        this.config = config;
        this.proxy = null;
    }

    private async createProxy(): Promise<Core> {
        const proxy = await createProxy({
            timeout: this.config.timeout,
            onerror: (error) => {
                this.config.logger.error("CoreWorkerWrapper: Error in core worker", error);
                this.proxy = null;
            }
        });

        return proxy;
    }

    public async getProxy(): Promise<Core> {
        if (this.proxy === null) {
            this.proxy = await this.createProxy();
        }

        return this.proxy;
    }
}

type ProxyConfig = {
    timeout: number;
    onerror: (error: any) => void;
};

async function createProxy(config: ProxyConfig): Promise<Core> {
    const worker = await createWorker(config.timeout);

    worker.onerror = (event) => {
        config.onerror(event.error);
    };

    await delay(100);

    return wrap<Core>(worker);
}

async function createWorker(timeout: number): Promise<Worker> {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error(`Failed to initialize core worker within timeout (${timeout}ms)`)), timeout);

        const coreWorker = new CoreWorker();

        coreWorker.onmessage = (event) => {
            if (event.data !== "ready") { return; }
            clearTimeout(timeoutId);
            resolve(coreWorker);
        };

        coreWorker.onerror = (event) => {
            clearTimeout(timeoutId);
            reject(event.error);
        }
    });
}