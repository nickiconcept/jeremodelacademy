import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, CloudOff, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { useGlobalUI } from '../contexts/GlobalUIContext';

export default function OfflineSyncControl({ user }) {
  const { confirm } = useGlobalUI();
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [queue, setQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const refreshQueue = () => {
      api.getOfflineQueue().then(setQueue).catch(() => setQueue([]));
    };
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    refreshQueue();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('jma-offline-queue-change', refreshQueue);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('jma-offline-queue-change', refreshQueue);
    };
  }, []);

  if (user?.role !== 'teacher') return null;

  const pendingCount = queue.filter((item) => !item.blocked).length;
  const blockedCount = queue.length - pendingCount;

  const handleSync = async () => {
    setIsSyncing(true);
    setMessage('');
    try {
      const result = await api.syncOfflineRequests();
      setMessage(result.message || (result.synced > 0 ? `${result.synced} item${result.synced === 1 ? '' : 's'} synced.` : 'Nothing to sync.'));
      setQueue(await api.getOfflineQueue());
    } catch (error) {
      setMessage(error.message || 'Sync failed. Your pending work remains on this device.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePrepareOffline = async () => {
    if (!isOnline) return;
    setIsPreparing(true);
    setMessage('Preparing assigned teaching data...');
    try {
      const [settings, assignments] = await Promise.all([
        api.getSettings(),
        api.getTeacherAssignments(),
      ]);
      const tasks = [api.getTimetables({ teacher_id: user.id })];
      if (settings.active_term && settings.active_session) {
        for (const assignment of assignments.subjects || []) {
          tasks.push(api.getGradesForEntry(assignment.class_id, assignment.subject_id, settings.active_term, settings.active_session));
          tasks.push(api.getSchemes({
            class_id: assignment.class_id,
            subject_id: assignment.subject_id,
            term: settings.active_term,
            academic_session: settings.active_session,
          }));
        }
      }

      if (assignments.formClass?.id) {
        const now = new Date();
        const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        tasks.push(api.getAttendance(assignments.formClass.id, localDate));
      }

      const results = await Promise.allSettled(tasks);
      const succeeded = results.filter((result) => result.status === 'fulfilled').length;
      const failed = results.length - succeeded;
      setMessage(failed === 0
        ? `Offline data ready: ${succeeded} assigned data sets saved on this device.`
        : `Offline data partly ready: ${succeeded} saved, ${failed} could not be downloaded. Reconnect and try again.`);
    } catch (error) {
      setMessage(error.message || 'Could not prepare offline data. Please check the connection and try again.');
    } finally {
      setIsPreparing(false);
    }
  };

  const handleDiscard = async (item) => {
    const accepted = await confirm({
      title: 'Discard this offline change?',
      message: `This removes the saved ${item.endpoint} change from this device. It will not be sent to the server.`,
      confirmText: 'Discard change',
      type: 'danger',
    });
    if (!accepted) return;
    await api.discardOfflineRequest(item.id);
    setQueue(await api.getOfflineQueue());
    setMessage('The selected offline change was discarded from this device.');
  };

  return (
    <section className={`offline-sync-control ${isOnline ? 'is-online' : 'is-offline'}`} aria-live="polite">
      <div className="offline-sync-control__status">
        {isOnline ? <CheckCircle2 size={17} /> : <CloudOff size={17} />}
        <div>
          <strong>{isOnline ? 'Online' : 'Offline mode'}</strong>
          <span>
            {blockedCount > 0
              ? `${pendingCount} pending · ${blockedCount} need attention`
              : pendingCount > 0
                ? `${pendingCount} change${pendingCount === 1 ? '' : 's'} waiting to sync`
                : isOnline ? 'All changes synced' : 'Changes will stay on this device until you sync'}
          </span>
        </div>
      </div>
      <div className="offline-sync-control__buttons">
        <button type="button" className="btn btn-secondary" onClick={handlePrepareOffline} disabled={!isOnline || isPreparing || isSyncing}>
          <CloudOff size={16} /> {isPreparing ? 'Preparing...' : 'Prepare for offline'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleSync} disabled={!isOnline || isSyncing || isPreparing || pendingCount === 0}>
          {blockedCount > 0 ? <AlertTriangle size={16} /> : <RefreshCw size={16} className={isSyncing ? 'is-spinning' : ''} />}
          {isSyncing ? 'Syncing...' : blockedCount > 0 ? 'Review sync issues' : pendingCount > 0 ? `Sync ${pendingCount}` : 'Synced'}
        </button>
      </div>
      {message && <p className="offline-sync-control__message">{message}</p>}
      {blockedCount > 0 && (
        <details className="offline-sync-control__issues">
          <summary>View items needing attention</summary>
          <ul>
            {queue.filter((item) => item.blocked).map((item) => (
              <li key={item.id}>
                <span>{item.lastError || `Saved ${new Date(item.createdAt).toLocaleString()}`}</span>
                <button type="button" className="offline-sync-control__discard" onClick={() => handleDiscard(item)}>Discard</button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}