import { useState, useEffect } from 'react';
import { syncOfflineData, hasPendingSync } from '../offline/sync-queue';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncPending, setSyncPending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const pending = await hasPendingSync();
      if (pending) {
        setSyncPending(true);
        setIsSyncing(true);
        try {
          const result = await syncOfflineData();
          console.log('Sync complete:', result);
          setSyncPending(false);
        } catch (error) {
          console.error('Sync failed:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check on mount
    hasPendingSync().then(setSyncPending);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const manualSync = async () => {
    if (!isOnline) {
      throw new Error('Cannot sync while offline');
    }
    
    setIsSyncing(true);
    try {
      const result = await syncOfflineData();
      setSyncPending(false);
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    syncPending,
    isSyncing,
    manualSync
  };
};
