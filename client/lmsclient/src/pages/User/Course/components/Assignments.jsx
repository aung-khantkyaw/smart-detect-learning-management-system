import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Assignments() {
  const { id } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({ textAnswer: '', file: null });
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, [id]);

  const fetchAssignments = async () => {
    const token = localStorage.getItem("accessToken");
    
    try {
      const res = await fetch(`http://localhost:3000/api/assignments/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAssignments(Array.isArray(data) ? data : data.data || []);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    const token = localStorage.getItem("accessToken");
    const userData = JSON.parse(localStorage.getItem("userData"));
    
    try {
      const res = await fetch(`http://localhost:3000/api/assignments/submissions/student/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSubmissions(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const openSubmissionModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionModal(true);
    setSubmissionData({ textAnswer: '', file: null });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("accessToken");
    const userData = JSON.parse(localStorage.getItem("userData"));
    
    const formData = new FormData();
    formData.append('studentId', userData.id);
    formData.append('textAnswer', submissionData.textAnswer);
    if (submissionData.file) {
      formData.append('file', submissionData.file);
    }
    
    try {
      const res = await fetch(`http://localhost:3000/api/assignment-submissions/${selectedAssignment.id}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        setShowSubmissionModal(false);
        fetchSubmissions();
        alert('Assignment submitted successfully!');
      } else {
        alert('Failed to submit assignment');
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
      alert('Error submitting assignment');
    }
  };

  const viewResult = (submission) => {
    setSelectedSubmission(submission);
    setShowResultModal(true);
  };

  const getSubmissionStatus = (assignmentId) => {
    return submissions.find(s => s.assignmentId === assignmentId);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SUBMITTED': return 'Under Review';
      case 'GRADED': return 'Graded';
      case 'REJECTED_AI': return 'AI Flagged';
      default: return 'Pending';
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
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Assignments</span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Assignments</h2>

        <div className="border border-gray-200 bg-gray-50">
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-sm font-medium text-gray-900">No assignments available</h3>
              <p className="mt-1 text-sm text-gray-500">There are no assignments for this course yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {assignments.map((assignment) => {
                const submission = getSubmissionStatus(assignment.id);
                const isOverdue = new Date() > new Date(assignment.dueAt);
                
                return (
                  <div key={assignment.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                      {submission && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          submission.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                          submission.status === 'REJECTED_AI' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {getStatusText(submission.status)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span className={isOverdue ? 'text-red-600' : ''}>
                          Due: {new Date(assignment.dueAt).toLocaleDateString()}
                        </span>
                        {submission && (
                          <span className="ml-4">
                            Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      <div>
                        {!submission ? (
                          <button 
                            onClick={() => openSubmissionModal(assignment)}
                            disabled={isOverdue}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${
                              isOverdue 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {isOverdue ? 'Overdue' : 'Submit'}
                          </button>
                        ) : (
                          <button 
                            onClick={() => viewResult(submission)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
                          >
                            View Result
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Submit Assignment</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Answer</label>
                <textarea
                  value={submissionData.textAnswer}
                  onChange={(e) => setSubmissionData({...submissionData, textAnswer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter your answer here..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setSubmissionData({...submissionData, file: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Submission Result</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="text-gray-900">{getStatusText(selectedSubmission.status)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Submitted At</label>
                <p className="text-gray-900">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
              </div>
              
              {selectedSubmission.aiScore && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">AI Score</label>
                  <p className="text-gray-900">{selectedSubmission.aiScore}%</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Your Answer</label>
                <p className="text-gray-900 bg-gray-50 p-3 border">{selectedSubmission.textAnswer}</p>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}