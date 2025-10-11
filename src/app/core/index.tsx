import { Logger, useLogging } from "@/app/logging";
import { type Core } from "@/core";
import { Period, PeriodType } from "@/core/types";
import { delay } from "@/utils/promises";
import CoreWorker from "@/workers/core-worker?worker";
import { wrap } from "comlink";
import { createContext, ParentComponent, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

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

                    const result = func(...args);

                    if (result instanceof Promise) {
                        return result.then((res) => {
                            // If we are disconnecting, clear the proxy so a new worker is created next time 
                            if (prop === "disconnect") {
                                coreWorkerWrapper.clearProxy();
                            }

                            return res;
                        });
                    }

                    // If we are disconnecting, clear the proxy so a new worker is created next time 
                    if (prop === "disconnect") {
                        coreWorkerWrapper.clearProxy();
                    }

                    return result;
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
    private proxy: ProxyResult | null;

    public constructor(config: CoreWorkerWrapperConfig) {
        this.config = config;
        this.proxy = null;
    }

    private async createProxy(): Promise<ProxyResult> {
        const result = await createProxy({
            timeout: this.config.timeout,
            onerror: (error) => {
                this.config.logger.error("CoreWorkerWrapper: Error in core worker", error);
                this.proxy = null;
            }
        })
            .catch((err) => {
                this.config.logger.error("CoreWorkerWrapper: Failed to create core worker proxy", err);
                throw err;
            });

        return result;
    }

    public async getProxy(): Promise<Core> {
        if (this.proxy === null) {
            this.proxy = await this.createProxy();
        }

        return this.proxy.proxy;
    }

    public clearProxy(): void {
        this.proxy?.worker.terminate();
        this.proxy = null;
    }
}

type ProxyConfig = {
    timeout: number;
    onerror: (error: any) => void;
};

type ProxyResult = {
    proxy: Core;
    worker: Worker;
};

async function createProxy(config: ProxyConfig): Promise<ProxyResult> {
    const worker = await createWorker(config.timeout);

    worker.onerror = (event) => {
        config.onerror(event.error);
    };

    await delay(100);

    return {
        proxy: wrap<Core>(worker),
        worker: worker,
    };
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

export type BudgetContext = {
    id: string | null;
    period: Period;
};

export type BudgetContextStore = [get: BudgetContext, set: SetStoreFunction<BudgetContext>];

const BudgetContext = createContext<BudgetContextStore>();

export const BudgetContextProvider: ParentComponent = (props) => {
    const context = createStore<BudgetContext>({
        id: null,
        period: {
            amount: 1,
            type: PeriodType.MONTH,
        },
    });

    return (
        <BudgetContext.Provider value={context}>
            {props.children}
        </BudgetContext.Provider>
    );
};

export function useBudgetContext(): BudgetContextStore {
    const context = useContext(BudgetContext);
    return context!;
}