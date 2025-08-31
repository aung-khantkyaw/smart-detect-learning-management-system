import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../../lib/api";
import ConfirmDeleteModal from "../../../../components/ConfirmDeleteModal";

export default function Assignments() {
  const { id } = useParams(); // course offering ID
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueAt: "",
    questionType: "TEXT",
    questionText: "",
    questionFile: null
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, [id]);

  const fetchAssignments = async () => {
    try {
      const data = await api.get(`/assignments/offering/${id}`);
      setAssignments(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (formData.questionType === "TEXT" && !formData.questionText.trim()) {
      alert("Please enter question text");
      return;
    }

    if (formData.questionType === "PDF" && !formData.questionFile) {
      alert("Please upload a question file");
      return;
    }

    try {
      let questionFileUrl = null;
      
      // If PDF mode, upload file first
      if (formData.questionType === "PDF" && formData.questionFile) {
        const fileFormData = new FormData();
        fileFormData.append('file', formData.questionFile);
        
        // You'll need to implement file upload endpoint
        // For now, we'll use a placeholder URL
        questionFileUrl = `uploads/assignments/${Date.now()}_${formData.questionFile.name}`;
      }
    
      const requestBody = {
        title: formData.title,
        description: formData.description || "",
        dueAt: formData.dueAt || null,
        questionType: formData.questionType,
        questionText: formData.questionType === "TEXT" ? formData.questionText : null,
        questionFileUrl: formData.questionType === "PDF" ? questionFileUrl : null
      };

      const result = await api.post(`/assignments/offering/${id}`, requestBody);
      console.log("Assignment created:", result);
      
      setShowCreateModal(false);
      setFormData({ 
        title: "", 
        description: "", 
        dueAt: "",
        questionType: "TEXT",
        questionText: "",
        questionFile: null
      });
      fetchAssignments();
      
      // Success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Assignment created successfully!
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (err) {
      console.error("Create assignment error:", err);
      alert("Failed to create assignment: " + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteAssignment = (assignment) => {
    setConfirmTarget(assignment);
    setDeleteError("");
    setShowConfirm(true);
  };

  const fetchSubmissions = async (assignment) => {
    try {
      const data = await api.get(`/assignments/${assignment.id}/submissions`);
      setSubmissions(Array.isArray(data) ? data : data.data || []);
      setSelectedAssignment(assignment);
      setShowSubmissionsModal(true);
    } catch (err) {
      console.error("Fetch submissions error:", err);
      alert("Failed to fetch submissions");
    }
  };

  const handleGradeSubmission = async (submissionId, score) => {
    try {
      await api.patch(`/assignments/submissions/${submissionId}/grade`, { 
        score: parseFloat(score) 
      });
      fetchSubmissions(selectedAssignment); // Refresh submissions
    } catch (err) {
      console.error("Grade submission error:", err);
      alert("Failed to grade submission");
    }
  };

  const handleGiveChance = async (submissionId) => {
    try {
      await api.patch(`/assignments/submissions/${submissionId}/give-chance`);
      fetchSubmissions(selectedAssignment); // Refresh submissions
      
      // Success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Resubmission chance given successfully!
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (err) {
      console.error("Give chance error:", err);
      alert("Failed to give resubmission chance: " + (err.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignment Management</h1>
            <p className="text-gray-600">Create and manage assignments for your course</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Assignment
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Assignments ({assignments.length})
            </h3>
          </div>
          <div className="p-6">
          
          {assignments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment) => {
                const now = new Date();
                const isOverdue = assignment.dueAt && now > new Date(assignment.dueAt);
                
                return (
                  <div key={assignment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                    {/* Card Header */}
                    <div className={`px-6 py-4 border-b border-gray-100 ${
                      assignment.questionType === 'TEXT' 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50' 
                        : 'bg-gradient-to-r from-purple-50 to-pink-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              assignment.questionType === 'TEXT' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {assignment.questionType === 'TEXT' ? '📝 Text' : '📄 PDF'}
                            </span>
                            {isOverdue && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                🚨 Overdue
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{assignment.title}</h3>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-6 py-4 flex-1">
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{assignment.description || 'No description provided'}</p>
                      
                      {assignment.questionType === 'TEXT' && assignment.questionText && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="font-medium text-blue-900 mb-1 text-xs">Question Preview:</p>
                          <p className="text-blue-800 text-sm line-clamp-2">{assignment.questionText}</p>
                        </div>
                      )}
                      
                      {assignment.questionType === 'PDF' && assignment.questionFileUrl && (
                        <div className="mb-4">
                          <a 
                            href={assignment.questionFileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Question File
                          </a>
                        </div>
                      )}
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Created: {new Date(assignment.createdAt).toLocaleDateString()}
                        </div>
                        {assignment.dueAt && (
                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Due: {new Date(assignment.dueAt).toLocaleDateString()} at {new Date(assignment.dueAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => fetchSubmissions(assignment)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Submissions
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment)}
                          className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-500">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl mb-6">
                  📝
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Create your first assignment to get started. You can add text-based questions or upload PDF files.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Assignment
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
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
                    📝
                  </div>
                  <h3 className="text-2xl font-bold">Create New Assignment</h3>
                  <p className="text-white/80 text-sm mt-1">Design an assignment for your students</p>
                </div>
              </div>
              
              <form onSubmit={handleCreateAssignment} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Question Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.questionType === "TEXT" 
                        ? "border-blue-500 bg-blue-50 text-blue-700" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <input
                        type="radio"
                        name="questionType"
                        value="TEXT"
                        checked={formData.questionType === "TEXT"}
                        onChange={(e) => setFormData({...formData, questionType: e.target.value, questionFile: null})}
                        className="sr-only"
                      />
                      <div className="text-center w-full">
                        <div className="text-2xl mb-1">📝</div>
                        <div className="font-medium text-sm">Text Question</div>
                        <div className="text-xs text-gray-500 mt-1">Type your question</div>
                      </div>
                    </label>
                    <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.questionType === "PDF" 
                        ? "border-purple-500 bg-purple-50 text-purple-700" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <input
                        type="radio"
                        name="questionType"
                        value="PDF"
                        checked={formData.questionType === "PDF"}
                        onChange={(e) => setFormData({...formData, questionType: e.target.value, questionText: ""})}
                        className="sr-only"
                      />
                      <div className="text-center w-full">
                        <div className="text-2xl mb-1">📄</div>
                        <div className="font-medium text-sm">PDF Upload</div>
                        <div className="text-xs text-gray-500 mt-1">Upload question file</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">📚 Assignment Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    placeholder="Enter assignment title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">📋 Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    rows="3"
                    placeholder="Provide assignment description..."
                  />
                </div>

              {formData.questionType === "TEXT" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">❓ Question Text</label>
                  <textarea
                    required
                    value={formData.questionText}
                    onChange={(e) => setFormData({...formData, questionText: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    rows="4"
                    placeholder="Enter your assignment question here..."
                  />
                </div>
              )}

              {formData.questionType === "PDF" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">📎 Upload Question File (PDF)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      required
                      onChange={(e) => setFormData({...formData, questionFile: e.target.files[0]})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.questionFile && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-green-800">
                            Selected: {formData.questionFile.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">📅 Due Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.dueAt}
                  onChange={(e) => setFormData({...formData, dueAt: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                />
                <p className="mt-2 text-xs text-gray-500">Leave empty if no due date is required</p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border-2 border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white relative">
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold mr-4">
                  📋
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Assignment Submissions</h3>
                  <p className="text-white/80 text-sm mt-1">{selectedAssignment.title}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                      {/* Card Header */}
                      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {(submission.studentName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{submission.studentName || 'Unknown Student'}</h4>
                              <p className="text-sm text-gray-500">Attempt #{submission.attemptNumber || 1}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              submission.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                              submission.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                              submission.status === 'REJECTED_AI' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {submission.status === 'REJECTED_AI' ? '🚫 AI Detected' :
                               submission.status === 'GRADED' ? '✅ Graded' :
                               submission.status === 'SUBMITTED' ? '📝 Submitted' : '⏳ Pending'}
                            </span>
                            {submission.score && (
                              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                submission.score < 50 ? 'bg-red-100 text-red-800' : 
                                submission.score < 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {submission.score}/100
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grade (0-100)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              defaultValue={submission.score || ''}
                              disabled={submission.status === 'REJECTED_AI'}
                              onBlur={(e) => {
                                if (e.target.value && e.target.value !== submission.score) {
                                  handleGradeSubmission(submission.id, e.target.value);
                                }
                              }}
                              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                submission.status === 'REJECTED_AI' 
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                              }`}
                              placeholder="Enter score..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Submitted At</label>
                            <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm text-gray-600">
                              {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Not submitted'}
                            </div>
                          </div>
                          <div className="flex items-end">
                            <div className="flex space-x-2 w-full">
                              {submission.textAnswer && (
                                <button
                                  onClick={() => {
                                    const modal = document.createElement('div');
                                    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
                                    modal.innerHTML = `
                                      <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
                                        <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                                          <h3 class="text-xl font-bold">Student Answer</h3>
                                          <p class="text-white/80 text-sm">${submission.studentName || 'Unknown Student'}</p>
                                        </div>
                                        <div class="p-6 overflow-y-auto max-h-96">
                                          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p class="whitespace-pre-wrap text-gray-800">${submission.textAnswer}</p>
                                          </div>
                                        </div>
                                        <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
                                          <button onclick="this.closest('.fixed').remove()" class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all">Close</button>
                                        </div>
                                      </div>
                                    `;
                                    document.body.appendChild(modal);
                                  }}
                                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border-2 border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Answer
                                </button>
                              )}
                              {submission.status === 'REJECTED_AI' && (submission.attemptNumber || 1) < 3 && (
                                <button
                                  onClick={() => handleGiveChance(submission.id)}
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-md"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Give Chance
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-blue-100 flex items-center justify-center text-3xl mb-6">
                    📄
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto">Students haven't submitted their assignments yet. Submissions will appear here once students start submitting their work.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={showConfirm}
        title="Delete Assignment"
        message={confirmTarget ? `This will permanently delete assignment "${confirmTarget.title}" and all its submissions.` : ""}
        requiredText={confirmTarget ? `delete ${confirmTarget.title}` : ""}
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
            await api.del(`/assignments/${confirmTarget.id}`);
            console.log("Assignment deleted successfully");
            setShowConfirm(false);
            setConfirmTarget(null);
            setDeleting(false);
            fetchAssignments();
          } catch (err) {
            console.error(err);
            setDeleteError(err.message || "Delete failed");
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}