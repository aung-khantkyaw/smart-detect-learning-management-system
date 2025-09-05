import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../../lib/api";

export default function BackupRestore() {
  const [backups, setBackups] = useState([]);
  const [summary, setSummary] = useState({});
  const [filter, setFilter] = useState(""); // '', 'daily', 'weekly', 'monthly'
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [last, setLast] = useState({});

  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true);
      const qs = filter ? `?type=${filter}` : "";
      const data = await api.get("/admin/backups" + qs);
      setBackups(data.items || []);
      setSummary(data.summary || {});
      setLast(data.last || {});
    } catch (error) {
      console.error("Error fetching backups:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const restoreBackup = async (filename) => {
    if (
      !confirm(
        `Are you sure you want to restore backup: ${filename}? This will overwrite all current data.`
      )
    ) {
      return;
    }

    try {
      setRestoring(true);
      await api.post("/admin/restore-backup", { filename });
      alert("Backup restored successfully!");
    } catch (error) {
      console.error("Error restoring backup:", error);
      alert("Failed to restore backup: " + error.message);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Database Backup & Restore
        </h1>
        {backups.length > 0 && (
          <div className="mb-4 p-4 rounded-md border border-blue-200 bg-blue-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Latest Backup
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {backups[0].filename}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Type: <span className="uppercase">{backups[0].type}</span> ·
                Size: {backups[0].size} · Created:{" "}
                {new Date(backups[0].created).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => restoreBackup(backups[0].filename)}
                disabled={restoring}
                className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {restoring ? "Restoring..." : "Restore This"}
              </button>
              <button
                onClick={fetchBackups}
                className="px-3 py-2 text-sm bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100"
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>
        )}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Last Any" value={last.overall} />
          <StatCard label="Last Daily" value={last.daily} />
          <StatCard label="Last Weekly" value={last.weekly} />
          <StatCard label="Last Monthly" value={last.monthly} />
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Available Backups
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Filter by retention tier (daily / weekly / monthly). "Manual"
                hidden unless filtered server-side later.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="daily">
                  Daily {summary.daily ? `(${summary.daily})` : ""}
                </option>
                <option value="weekly">
                  Weekly {summary.weekly ? `(${summary.weekly})` : ""}
                </option>
                <option value="monthly">
                  Monthly {summary.monthly ? `(${summary.monthly})` : ""}
                </option>
              </select>
              <button
                onClick={fetchBackups}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-sm text-gray-500">
                No backups found for selected filter.
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div
                    key={backup.filename + backup.type}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {backup.filename}
                      </h3>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                        {backup.type}
                      </p>
                      <p className="text-sm text-gray-500">
                        Size: {backup.size} | Created:{" "}
                        {new Date(backup.created).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => restoreBackup(backup.filename)}
                      disabled={restoring}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {restoring ? "Restoring..." : "Restore"}
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

function StatCard({ label, value }) {
  return (
    <div className="p-3 bg-white rounded-md border border-gray-200 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900 mt-1">
        {value ? new Date(value).toLocaleString() : "—"}
      </p>
    </div>
  );
}
