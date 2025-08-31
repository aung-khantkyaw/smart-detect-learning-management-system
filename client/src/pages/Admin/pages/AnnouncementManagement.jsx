import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [scopeFilter, setScopeFilter] = useState(""); // "" | "ACADEMIC" | "COURSE"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    scope: "ACADEMIC", // 'ACADEMIC' | 'COURSE'
    scopeId: ""        // if COURSE, this is offeringId; if ACADEMIC, use 'GLOBAL'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [announcementsData, coursesData, offeringsData, teachersData] = await Promise.all([
        api.get("/announcements"),
        api.get("/courses"),
        api.get("/course-offerings"),
        api.get("/users?role=TEACHER"),
      ]);

      setAnnouncements(Array.isArray(announcementsData) ? announcementsData : announcementsData?.data || []);
      setCourses(Array.isArray(coursesData) ? coursesData : coursesData?.data || []);
      setCourseOfferings(Array.isArray(offeringsData) ? offeringsData : offeringsData?.data || []);
      setTeachers(Array.isArray(teachersData) ? teachersData : teachersData?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = (
      announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesScope = !scopeFilter || announcement.scope === scopeFilter;
    return matchesSearch && matchesScope;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare payload aligned with backend controller (scope, scopeId, title, content)
      const payloadBase = {
        title: formData.title,
        content: formData.content,
        scope: formData.scope,
      };
      const payload = formData.scope === "COURSE"
        ? { ...payloadBase, scopeId: formData.scopeId }
        : payloadBase; // omit scopeId for academic; backend will resolve

      if (editingAnnouncement) {
        await api.put(`/announcements/${editingAnnouncement.id}`, {
          title: payload.title,
          content: payload.content,
        });
      } else {
        await api.post("/announcements", payload);
      }
      setShowCreateModal(false);
      fetchData();
      setFormData({ title: "", content: "", scope: "ACADEMIC", scopeId: "" });
    } catch (err) {
      console.error(err);
      alert(err.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await api.del(`/announcements/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Delete failed");
    }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcement Management</h1>
            <p className="text-gray-600">Create and manage course announcements</p>
          </div>
          <button
            onClick={() => {
              setEditingAnnouncement(null);
              setFormData({ title: "", content: "", scope: "ACADEMIC", scopeId: "" });
              setShowCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Announcement
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Announcements</label>
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="ACADEMIC">Academic</option>
                <option value="COURSE">Course</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => {
              const isCourse = announcement.scope === 'COURSE';
              const offering = isCourse ? courseOfferings.find(o => o.id === announcement.scopeId) : null;
              const course = offering ? courses.find(c => c.id === offering.courseId) : null;
              const teacher = offering ? teachers.find(t => t.id === offering.teacherId) : null;
              return (
                <div key={announcement.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isCourse ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {isCourse ? 'COURSE' : 'ACADEMIC'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {isCourse ? (
                            <>Course: {course?.title || course?.name || 'Unknown'} — {teacher?.fullName || 'Unknown'}</>
                          ) : (
                            <>Scope: Academic (All)</>
                          )}
                        </span>
                        <span>•</span>
                        <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingAnnouncement(announcement);
                          setFormData({
                            title: announcement.title || "",
                            content: announcement.content || "",
                            scope: announcement.scope || "ACADEMIC",
                            scopeId: announcement.scope === 'COURSE' ? (announcement.scopeId || '') : ''
                          });
                          setShowCreateModal(true);
                        }}
                        className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white relative">
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
                    🛎️
                  </div>
                  <h3 className="text-2xl font-bold">{editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</h3>
                  <p className="text-white/80 text-sm mt-1">Share updates with everyone or a specific course</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Scope selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Announcement Scope</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.scope === 'ACADEMIC' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        value="ACADEMIC"
                        checked={formData.scope === 'ACADEMIC'}
                        onChange={(e) => setFormData({ ...formData, scope: e.target.value, scopeId: '' })}
                        className="sr-only"
                      />
                      <div className="text-center w-full">
                        <div className="text-2xl mb-1">🏫</div>
                        <div className="font-medium text-sm">Academic (All)</div>
                      </div>
                    </label>
                    <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.scope === 'COURSE' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        value="COURSE"
                        checked={formData.scope === 'COURSE'}
                        onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                        className="sr-only"
                      />
                      <div className="text-center w-full">
                        <div className="text-2xl mb-1">📚</div>
                        <div className="font-medium text-sm">Course Offering</div>
                      </div>
                    </label>
                  </div>
                </div>

                {formData.scope === 'COURSE' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Select Offering</label>
                    <select
                      required
                      value={formData.scopeId}
                      onChange={(e) => setFormData({ ...formData, scopeId: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    >
                      <option value="">Choose course offering...</option>
                      {courseOfferings.map(offering => {
                        const course = courses.find(c => c.id === offering.courseId);
                        const teacher = teachers.find(t => t.id === offering.teacherId);
                        return (
                          <option key={offering.id} value={offering.id}>
                            {course?.title || course?.name} - {teacher?.fullName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    placeholder="Enter announcement title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Content</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    placeholder="Enter announcement content"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    {editingAnnouncement ? 'Update' : 'Create'}
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