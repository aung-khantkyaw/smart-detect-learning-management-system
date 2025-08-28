import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../../lib/api";

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

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    
    try {
      await api.del(`/assignments/${assignmentId}`);
      fetchAssignments();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Assignment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {assignments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        assignment.questionType === 'TEXT' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {assignment.questionType === 'TEXT' ? '📝 Text' : '📄 PDF'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                    {assignment.questionType === 'TEXT' && assignment.questionText && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        <strong>Question:</strong> {assignment.questionText}
                      </div>
                    )}
                    {assignment.questionType === 'PDF' && assignment.questionFileUrl && (
                      <div className="mt-2">
                        <a 
                          href={assignment.questionFileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Question File
                        </a>
                      </div>
                    )}
                    <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
                      <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                      {assignment.dueAt && (
                        <span className={`${
                          new Date(assignment.dueAt) < new Date() ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          Due: {new Date(assignment.dueAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchSubmissions(assignment)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Submissions
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments created</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first assignment.</p>
          </div>
        )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                  <textarea
                    required
                    value={formData.questionText}
                    onChange={(e) => setFormData({...formData, questionText: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Enter your assignment question here..."
                  />
                </div>
              )}

              {formData.questionType === "PDF" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Question File (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => setFormData({...formData, questionFile: e.target.files[0]})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.questionFile && (
                    <p className="mt-1 text-sm text-gray-600">
                      Selected: {formData.questionFile.name}
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  value={formData.dueAt}
                  onChange={(e) => setFormData({...formData, dueAt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Assignment Submissions - {selectedAssignment.title}
                </h3>
                <button
                  onClick={() => setShowSubmissionsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {submissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submissions.map((submission) => (
                        <tr key={submission.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {submission.studentName || 'Unknown Student'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              submission.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                              submission.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                              submission.status === 'REJECTED_AI' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {submission.score ? (
                              <span className={`font-medium ${
                                submission.score < 50 ? 'text-red-600' : 
                                submission.score < 80 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {submission.score}
                              </span>
                            ) : 'Not graded'}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              defaultValue={submission.score || ''}
                              onBlur={(e) => {
                                if (e.target.value && e.target.value !== submission.score) {
                                  handleGradeSubmission(submission.id, e.target.value);
                                }
                              }}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Score"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Not submitted'}
                          </td>
                          <td className="px-4 py-3">
                            {submission.textAnswer && (
                              <button
                                onClick={() => {
                                  const modal = document.createElement('div');
                                  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
                                  modal.innerHTML = `
                                    <div class="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto">
                                      <div class="p-4 border-b">
                                        <h3 class="text-lg font-semibold">Student Answer</h3>
                                      </div>
                                      <div class="p-4">
                                        <p class="whitespace-pre-wrap">${submission.textAnswer}</p>
                                      </div>
                                      <div class="p-4 border-t flex justify-end">
                                        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
                                      </div>
                                    </div>
                                  `;
                                  document.body.appendChild(modal);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View Answer
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm">No submissions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}