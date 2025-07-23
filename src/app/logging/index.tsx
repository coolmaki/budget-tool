import { createContext, createEffect, JSX, ParentProps, useContext } from "solid-js";

type DebugLogger = typeof console.debug;
type InfoLogger = typeof console.info;
type WarnLogger = typeof console.warn;
type ErrorLogger = typeof console.error;

export type Logger = {
    debug: DebugLogger;
    info: InfoLogger;
    warn: WarnLogger;
    error: ErrorLogger;
};

export function createLogger(): Logger {
    return console;
}

export function trackValue<T>(logger: Logger, template: string, value: () => T): void {
    if (import.meta.env.DEV) {
        createEffect(() => {
            logger.debug(template, value());
        });
    }
}

const LoggingContext = createContext<Logger>();

export function LoggingProvider(props: ParentProps): JSX.Element {
    const logger = createLogger();

    return (
        <LoggingContext.Provider value={logger}>
            {props.children}
        </LoggingContext.Provider>
    );
}

export function useLogging(): Logger {
    const logger = useContext(LoggingContext);
    return logger!;
}
