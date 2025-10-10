import { useLogging } from '@/app/logging';
import { Accessor, createContext, createMemo, createSignal, ParentComponent, useContext } from 'solid-js';
import { useRegisterSW } from 'virtual:pwa-register/solid'; // https://vite-pwa-org.netlify.app/frameworks/solidjs

type UpdateStatus = "none" | "available" | "error";

type UpdatesContext = {
    updateStatus: Accessor<UpdateStatus>;
    updateApplication: (reload?: boolean) => Promise<void>;
};

const UpdatesContext = createContext<UpdatesContext>();

export const UpdatesContextProvider: ParentComponent = (props) => {
    const logger = useLogging();

    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            // eslint-disable-next-line prefer-template
            logger.info('SW Registered: ' + r);
        },
        onRegisterError(error) {
            logger.error('SW registration error', error);
        },
    });

    const [hasError, setHasError] = createSignal(false);

    const updateStatus = createMemo<UpdateStatus>(() => {
        if (hasError()) {
            return "error";
        }
        if (needRefresh()) {
            return "available";
        }
        return "none";
    });

    async function updateApplication(reload?: boolean): Promise<void> {
        try {
            setHasError(false);
            await updateServiceWorker(reload);
            // clear the flag locally after applying the update (if provided by the hook)
            setNeedRefresh?.(false);
            // optionally mark offlineReady as true after successful update
            setOfflineReady?.(true);
            logger.info('Service worker updated' + (reload ? ' with reload' : ' without reload'));
        } catch (err) {
            logger.error('SW update failed', err);
            setHasError(true);
        }
    }

    return (
        <UpdatesContext.Provider value={{ updateStatus, updateApplication }}>
            {props.children}
        </UpdatesContext.Provider>
    );
}

export function useUpdates(): UpdatesContext {
    const context = useContext(UpdatesContext);
    return context!;
}