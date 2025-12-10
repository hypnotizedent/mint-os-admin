import { useOffline } from '../../../hooks/useOffline';

export const OfflineIndicator = () => {
  const { isOnline, syncPending, isSyncing, manualSync } = useOffline();

  if (isOnline && !syncPending && !isSyncing) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      {!isOnline && (
        <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-900 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold">Offline Mode</p>
              <p className="text-sm">Data will sync when reconnected</p>
            </div>
          </div>
        </div>
      )}

      {isOnline && isSyncing && (
        <div className="bg-blue-100 border-2 border-blue-400 text-blue-900 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin text-2xl">⟳</div>
            <div className="flex-1">
              <p className="font-semibold">Syncing...</p>
              <p className="text-sm">Uploading offline data</p>
            </div>
          </div>
        </div>
      )}

      {isOnline && syncPending && !isSyncing && (
        <div className="bg-green-100 border-2 border-green-400 text-green-900 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📤</span>
            <div className="flex-1">
              <p className="font-semibold">Data pending sync</p>
              <button
                onClick={() => manualSync()}
                className="text-sm underline hover:no-underline"
              >
                Sync now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
