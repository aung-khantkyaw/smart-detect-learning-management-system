import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
    dueAt: ""
  });

  useEffect(() => {
    fetchAssignments();
  }, [id]);

  const fetchAssignments = async () => {
    const token = localStorage.getItem("accessToken");
    
    try {
      const res = await fetch(`http://localhost:3000/api/assignments/offering/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        console.error("Failed to fetch assignments:", res.status, res.statusText);
        setAssignments([]);
        return;
      }
      
      const data = await res.json();
      console.log("Assignments response:", data);
      
      if (Array.isArray(data)) {
        setAssignments(data);
      } else if (data.status === "success") {
        setAssignments(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("Assignments API error:", data.message || 'Unknown error');
        setAssignments([]);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }
    
    const requestBody = {
      title: formData.title,
      description: formData.description || "",
      dueAt: formData.dueAt || null
    };

    try {
      const res = await fetch(`http://localhost:3000/api/assignments/offering/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (res.ok) {
        const result = await res.json();
        console.log("Assignment created:", result);
        setShowCreateModal(false);
        setFormData({ title: "", description: "", dueAt: "" });
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
      } else {
        const error = await res.json();
        alert(error.message || "Failed to create assignment");
      }
    } catch (err) {
      console.error("Create assignment error:", err);
      alert("Failed to create assignment: " + err.message);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    
    const token = localStorage.getItem("accessToken");
    
    try {
      const res = await fetch(`http://localhost:3000/api/assignments/${assignmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchAssignments();
      } else {
        const error = await res.json();
        alert(error.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  };

  const fetchSubmissions = async (assignment) => {
    const token = localStorage.getItem("accessToken");
    
    try {
      const res = await fetch(`http://localhost:3000/api/assignments/${assignment.id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSubmissions(Array.isArray(data) ? data : data.data || []);
        setSelectedAssignment(assignment);
        setShowSubmissionsModal(true);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to fetch submissions");
      }
    } catch (err) {
      console.error("Fetch submissions error:", err);
      alert("Failed to fetch submissions");
    }
  };

  const handleGradeSubmission = async (submissionId, grade) => {
    const token = localStorage.getItem("accessToken");
    
    try {
      const res = await fetch(`http://localhost:3000/api/assignments/submissions/${submissionId}/grade`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ grade: parseFloat(grade) })
      });
      
      if (res.ok) {
        fetchSubmissions(selectedAssignment); // Refresh submissions
      } else {
        const error = await res.json();
        alert(error.message || "Failed to grade submission");
      }
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
                    <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
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
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Create Assignment</h3>
            </div>
            
            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Score</th>
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
                            {submission.aiScore ? (
                              <span className={`font-medium ${
                                submission.aiScore < 50 ? 'text-red-600' : 
                                submission.aiScore < 80 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {submission.aiScore}%
                              </span>
                            ) : 'Not checked'}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              defaultValue={submission.grade || ''}
                              onBlur={(e) => {
                                if (e.target.value && e.target.value !== submission.grade) {
                                  handleGradeSubmission(submission.id, e.target.value);
                                }
                              }}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Grade"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Not submitted'}
                          </td>
                          <td className="px-4 py-3">
                            {submission.fileUrl && (
                              <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View File
                              </a>
                            )}
                            {submission.textAnswer && (
                              <button
                                onClick={() => alert(submission.textAnswer)}
                                className="text-blue-600 hover:text-blue-800 text-sm ml-2"
                              >
                                View Text
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