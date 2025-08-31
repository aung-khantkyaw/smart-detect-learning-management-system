import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function BackupRestore() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/backups');
      setBackups(data);
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (filename) => {
    if (!confirm(`Are you sure you want to restore backup: ${filename}? This will overwrite all current data.`)) {
      return;
    }

    try {
      setRestoring(true);
      await api.post('/admin/restore-backup', { filename });
      alert('Backup restored successfully!');
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Failed to restore backup: ' + error.message);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Database Backup & Restore</h1>
        
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Available Backups</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div key={backup.filename} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{backup.filename}</h3>
                      <p className="text-sm text-gray-500">
                        Size: {backup.size} | Created: {new Date(backup.created).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => restoreBackup(backup.filename)}
                      disabled={restoring}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {restoring ? 'Restoring...' : 'Restore'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}