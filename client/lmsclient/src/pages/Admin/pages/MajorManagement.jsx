import React, { useEffect, useState } from "react";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import { api } from "../../../lib/api";

export default function MajorManagement() {
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMajor, setEditingMajor] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchMajors();
  }, []);

  const fetchMajors = async () => {
    try {
      const data = await api.get("/majors");
      setMajors(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Error fetching majors:", err);
      setMajors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMajors = majors.filter(major =>
    major.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingMajor) {
        await api.put(`/majors/${editingMajor.id}`, formData);
      } else {
        await api.post("/majors", formData);
      }
      setShowCreateModal(false);
      fetchMajors();
      setFormData({ name: "" });
    } catch (err) {
      console.error(err);
      alert(err.message || "Operation failed");
    }
  };

  const handleDelete = (major) => {
    setConfirmTarget(major);
    setDeleteError("");
    setShowConfirm(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Major Management</h1>
            <p className="text-gray-600">Manage academic majors</p>
          </div>
          <button
            onClick={() => {
              setEditingMajor(null);
              setFormData({ name: "" });
              setShowCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Major
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Majors</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Majors ({filteredMajors.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMajors.length > 0 ? (
                  filteredMajors.map((major) => (
                    <tr key={major.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{major.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(major.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => {
                            setEditingMajor(major);
                            setFormData({ name: major.name || "" });
                            setShowCreateModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(major)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No majors found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirm Delete Modal */}
        <ConfirmDeleteModal
          open={showConfirm}
          title="Delete Major"
          message={confirmTarget ? `This will permanently delete major "${confirmTarget.name}".` : ""}
          requiredText={confirmTarget ? `delete ${confirmTarget.name}` : ""}
          confirmLabel="Delete"
          error={deleteError}
          loading={deleting}
          onClose={() => {
            setShowConfirm(false);
            setConfirmTarget(null);
            setDeleting(false);
            setDeleteError("");
          }}
          onConfirm={async () => {
            if (!confirmTarget) return;
            try {
              setDeleting(true);
              setDeleteError("");
              await api.del(`/majors/${confirmTarget.id}`);
              setShowConfirm(false);
              setConfirmTarget(null);
              setDeleting(false);
              fetchMajors();
            } catch (err) {
              console.error(err);
              setDeleteError(err.message || "Delete failed");
              setDeleting(false);
            }
          }}
        />

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-8 text-white relative">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    🎓
                  </div>
                  <h3 className="text-2xl font-bold">
                    {editingMajor ? 'Edit Major' : 'Create Major'}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">
                    {editingMajor ? 'Update major information' : 'Add a new academic major'}
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    🏷️ Major Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                    placeholder="Enter major name..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    {editingMajor ? 'Update Major' : 'Create Major'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}