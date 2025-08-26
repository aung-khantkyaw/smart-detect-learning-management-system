import React, { useState, useEffect } from "react";

export default function ConfirmDeleteModal({
  open,
  title = "Confirm Deletion",
  message = "This action cannot be undone.",
  requiredText,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
  error,
  loading = false,
}) {
  const [input, setInput] = useState("");

  useEffect(() => {
    if (open) setInput("");
  }, [open]);

  if (!open) return null;

  const canConfirm = (input || "").trim().toLowerCase() === (requiredText || "").trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700">{message}</p>
          {requiredText && (
            <>
              <p className="text-sm text-gray-600">
                Type <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{requiredText}</span> to confirm
              </p>
              <input
                autoFocus
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder={requiredText}
              />
            </>
          )}
          {error ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {String(error)}
            </div>
          ) : null}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium ${
                loading ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canConfirm || loading}
              onClick={() => canConfirm && !loading && onConfirm?.()}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white inline-flex items-center justify-center ${
                !canConfirm || loading ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {confirmLabel}
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
