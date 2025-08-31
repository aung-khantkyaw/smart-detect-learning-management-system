import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../../lib/api";

export default function Announcements() {
  const { id } = useParams(); // offeringId from route
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch announcements directly by offeringId
      const data = await api.get(
        `/announcements?scope=COURSE&scopeId=${id}`
      );
      setAnnouncements(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load announcements");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📢 Course Announcements
            </h1>
            <p className="text-gray-600">
              Latest updates and information from your teacher
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid gap-6">
          {announcements.length > 0 ? (
            announcements.map((a) => (
              <div
                key={a.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <span className="text-lg">📢</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                          {a.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <span>
                            {new Date(
                              a.createdAt || a.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      COURSE
                    </span>
                  </div>
                  <div className="mt-4 text-gray-700 leading-relaxed">
                    {a.content || a.description}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No announcements yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                When your teacher posts updates, you'll see them here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
