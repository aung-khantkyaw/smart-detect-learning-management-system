import React, { useEffect, useState } from 'react';
import { Eye, Download, FileText } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { api } from '../../../../lib/api';

export default function Materials() {
  const { id } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  // Resolve a file URL from backend: if relative like "/uploads/...", prefix with API origin
  const apiOrigin = (() => {
    try {
      const u = new URL(api.baseUrl);
      u.pathname = '';
      return u.toString().replace(/\/$/, '');
    } catch {
      return api.baseUrl.replace(/\/api$/, '');
    }
  })();

  const resolveFileUrl = (u) => {
    if (!u) return null;
    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith('/')) return `${apiOrigin}${u}`;
    return `${apiOrigin}/${u}`;
  };

  const getTypeFromName = (name = '') => {
    const n = name.toLowerCase();
    if (n.match(/\.(png|jpe?g|gif|webp|svg)$/)) return 'image';
    if (n.match(/\.(mp4|webm|ogg|mov|m4v)$/)) return 'video';
    if (n.match(/\.(pdf|docx?|pptx?|xlsx?)$/)) return 'document';
    return 'other';
  };

  // Open preview: for documents we use authenticated download in new tab; others inside modal
  const openPreview = async (m) => {
    try {
      const raw = m.fileUrl || m.url || m.__resolvedUrl || null;
      const url = raw ? resolveFileUrl(raw) : null;
      const type = m.type || m.__type || getTypeFromName(url || m.title);
      const isPdf = (url || m.title || '').toLowerCase().endsWith('.pdf');
      if (type === 'document') {
        const base = api.baseUrl.replace(/\/$/, '');
        const dlUrl = `${base}/materials/${m.id}/download`;
        const token = (() => { try { return localStorage.getItem('accessToken'); } catch { return null; } })();
        const res = await fetch(dlUrl, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
        if (!res.ok) throw new Error('Failed to load preview');
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank', 'noopener');
        return;
      }
      setPreviewItem({ ...m, url });
    } catch (e) {
      console.error('Preview error:', e);
      alert(e.message || 'Preview failed');
    }
  };

  // Authenticated direct download using backend download endpoint
  const downloadMaterial = async (m) => {
    try {
      const base = api.baseUrl.replace(/\/$/, '');
      const url = `${base}/materials/${m.id}/download`;
      const token = (() => { try { return localStorage.getItem('accessToken'); } catch { return null; } })();
      const res = await fetch(url, {
        method: 'GET',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Download failed (${res.status})`);
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = m.title || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Download error:', err);
      alert(err.message || 'Download failed');
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [id]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      // Route now uses offeringId directly
      const materialsData = await api.get(`/materials/offering/${id}`);
      const list = Array.isArray(materialsData) ? materialsData : materialsData?.data || [];
      setMaterials(list);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = materials.filter((m) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (m.title || '').toLowerCase().includes(q);
  });

  // Group by type for sectioned rendering
  const groups = (() => {
    const g = { image: [], video: [], document: [], other: [] };
    for (const m of filtered) {
      const raw = m.fileUrl || m.url || null;
      const url = resolveFileUrl(raw);
      const t = m.type || getTypeFromName(url || m.title);
      (g[t] ? g[t] : g.other).push({ ...m, __resolvedUrl: url, __type: t });
    }
    return g;
  })();

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-md">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">📚 Course Materials</h2>
          <p className="text-sm text-gray-500">Browse and download resources for this course</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {filtered.length ? (
        <div className="space-y-8">
          {[
            { key: 'image', title: 'Images' },
            { key: 'video', title: 'Videos' },
            { key: 'document', title: 'Documents' },
            { key: 'other', title: 'Others' },
          ].map((section) => (
            groups[section.key].length > 0 && (
              <div key={section.key}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  <span className="text-xs text-gray-500">{groups[section.key].length} item(s)</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groups[section.key].map((m) => {
                    const url = m.__resolvedUrl;
                    const type = m.__type;
                    return (
                      <div key={m.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                        <div className="h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                          {type === 'image' && url ? (
                            <img src={url} alt={m.title} className="h-full w-full object-cover" />
                          ) : type === 'video' ? (
                            <div className="flex flex-col items-center text-gray-600">
                              <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14V10z"/><rect x="3" y="6" width="12" height="12" rx="2" ry="2" strokeWidth="2"/></svg>
                              <span className="text-xs">Video</span>
                            </div>
                          ) : type === 'document' ? (
                            <div className="flex flex-col items-center text-gray-600">
                              <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 3h8l4 4v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 3v4h4"/></svg>
                              <span className="text-xs">Document</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-gray-600">
                              <FileText className="w-10 h-10 mb-2" />
                              <span className="text-xs">Material</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 truncate" title={m.title}>{m.title}</h3>
                          <div className="mt-1 text-xs text-gray-500">Uploaded {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : (m.date || '')}</div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openPreview(m)}
                                className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 inline-flex items-center"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                              </button>
                              <button
                                onClick={() => downloadMaterial(m)}
                                className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 inline-flex items-center"
                              >
                                <Download className="w-3.5 h-3.5 mr-1" /> Download
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl bg-gray-50">
          <div className="mx-auto w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-400 mb-3">📄</div>
          <h3 className="text-base font-semibold text-gray-900">No materials yet</h3>
          <p className="mt-1 text-sm text-gray-500">Materials will appear here once uploaded by the teacher.</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            if (previewItem?.blobUrl) {
              try { URL.revokeObjectURL(previewItem.blobUrl); } catch {}
            }
            setPreviewItem(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[75vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-lg font-semibold truncate">Preview: {previewItem.title}</h3>
              <button
                onClick={() => {
                  if (previewItem?.blobUrl) {
                    try { URL.revokeObjectURL(previewItem.blobUrl); } catch {}
                  }
                  setPreviewItem(null);
                }}
                className="text-white/90 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 bg-gray-50">
              {(() => {
                const url = previewItem.blobUrl || resolveFileUrl(previewItem.url);
                const type = previewItem.type || getTypeFromName(url || previewItem.title);
                if (!url) {
                  return (
                    <div className="h-full w-full flex items-center justify-center text-gray-500 p-6 text-center">
                      Preview not available. Try downloading instead.
                    </div>
                  );
                }
                if (type === 'image') {
                  return (
                    <div className="h-full w-full flex items-center justify-center bg-black">
                      <img src={url} alt={previewItem.title} className="max-h-full max-w-full object-contain" />
                    </div>
                  );
                }
                if (type === 'video') {
                  return <video src={url} controls className="h-full w-full bg-black" />;
                }
                return (
                  <div className="h-full w-full flex items-center justify-center text-gray-600 p-6 text-center">
                    This file type cannot be previewed here. <a href={url} target="_blank" rel="noopener noreferrer" className="ml-2 text-indigo-600 underline">Open in new tab</a>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}