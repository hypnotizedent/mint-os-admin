import {
  getUnsyncedTimeEntries,
  deleteTimeEntry,
  getUnsyncedChecklists,
  deleteChecklistEntry,
  type TimeEntry,
  type ChecklistEntry
} from './offline-storage';

// Mock API functions - replace with actual API calls
const mockTimeEntryAPI = async (entry: TimeEntry): Promise<void> => {
  console.log('Syncing time entry:', entry);
  // In real implementation, this would be an API call
  await new Promise(resolve => setTimeout(resolve, 100));
};

const mockChecklistAPI = async (entry: ChecklistEntry): Promise<void> => {
  console.log('Syncing checklist:', entry);
  // In real implementation, this would be an API call
  await new Promise(resolve => setTimeout(resolve, 100));
};

// Sync offline data when back online
export const syncOfflineData = async (): Promise<{
  timeEntriesSynced: number;
  checklistsSynced: number;
  errors: Array<{ type: string; id: string; error: string }>;
}> => {
  const errors: Array<{ type: string; id: string; error: string }> = [];
  let timeEntriesSynced = 0;
  let checklistsSynced = 0;

  // Sync time entries
  const timeEntries = await getUnsyncedTimeEntries();
  for (const entry of timeEntries) {
    try {
      await mockTimeEntryAPI(entry);
      await deleteTimeEntry(entry.id);
      timeEntriesSynced++;
    } catch (error) {
      console.error('Sync failed for time entry', entry.id, error);
      errors.push({
        type: 'time-entry',
        id: entry.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Sync checklists
  const checklists = await getUnsyncedChecklists();
  for (const entry of checklists) {
    try {
      await mockChecklistAPI(entry);
      await deleteChecklistEntry(entry.id);
      checklistsSynced++;
    } catch (error) {
      console.error('Sync failed for checklist', entry.id, error);
      errors.push({
        type: 'checklist',
        id: entry.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return { timeEntriesSynced, checklistsSynced, errors };
};

// Check if there's pending data to sync
export const hasPendingSync = async (): Promise<boolean> => {
  const timeEntries = await getUnsyncedTimeEntries();
  const checklists = await getUnsyncedChecklists();
  return timeEntries.length > 0 || checklists.length > 0;
};
