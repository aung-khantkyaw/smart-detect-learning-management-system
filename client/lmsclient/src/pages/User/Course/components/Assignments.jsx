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
      // Get offering ID from course ID
      const offeringsRes = await fetch(`http://localhost:3000/api/course-offerings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const offeringsData = await offeringsRes.json();
      const offerings = offeringsData.status === "success" ? offeringsData.data : [];
      const offering = offerings.find(o => o.courseId === id);
      
      if (!offering) {
        setAssignments([]);
        return;
      }
      
      // Fetch assignments for this offering
      const res = await fetch(`http://localhost:3000/api/assignments/offering/${offering.id}`, {
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
      const res = await fetch(`http://localhost:3000/api/assignment-submissions/student/${userData.id}`, {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED': return 'text-blue-600';
      case 'GRADED': return 'text-green-600';
      case 'REJECTED_AI': return 'text-red-600';
      default: return 'text-gray-600';
    }
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
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Assignments</h2>

      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments available</h3>
          <p className="mt-1 text-sm text-gray-500">There are no assignments for this course yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => {
            const submission = getSubmissionStatus(assignment.id);
            const isOverdue = new Date() > new Date(assignment.dueAt);
            
            return (
              <div key={assignment.id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
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
                
                <p className="text-gray-600 mb-4 line-clamp-3">{assignment.description}</p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className={`${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                    Due: {new Date(assignment.dueAt).toLocaleString()}
                  </div>
                  
                  {submission && (
                    <>
                      <div className="text-gray-500">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </div>
                      {submission.aiScore && (
                        <div className="text-blue-600">
                          AI Score: {submission.aiScore}%
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="space-y-2">
                  {!submission ? (
                    <button 
                      onClick={() => openSubmissionModal(assignment)}
                      disabled={isOverdue}
                      className={`w-full py-2 px-4 rounded-md transition ${
                        isOverdue 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isOverdue ? 'Overdue' : 'Submit Assignment'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => viewResult(submission)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition"
                    >
                      View Submission
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Submit Assignment</h3>
                <button 
                  onClick={() => setShowSubmissionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedAssignment?.title}</h4>
                <p className="text-gray-600 text-sm">{selectedAssignment?.description}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Answer</label>
                  <textarea
                    value={submissionData.textAnswer}
                    onChange={(e) => setSubmissionData({...submissionData, textAnswer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="6"
                    placeholder="Enter your answer here..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload File (Optional)</label>
                  <input
                    type="file"
                    onChange={(e) => setSubmissionData({...submissionData, file: e.target.files[0]})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!submissionData.textAnswer.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Assignment Result</h3>
                <button 
                  onClick={() => setShowResultModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 ${getStatusColor(selectedSubmission.status)}`}>
                        {getStatusText(selectedSubmission.status)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span>
                      <span className="ml-2">{new Date(selectedSubmission.submittedAt).toLocaleString()}</span>
                    </div>
                    {selectedSubmission.aiScore && (
                      <div>
                        <span className="font-medium">AI Score:</span>
                        <span className="ml-2 text-blue-600">{selectedSubmission.aiScore}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Your Submission:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedSubmission.textAnswer}</p>
                    {selectedSubmission.fileUrl && (
                      <div className="mt-2">
                        <a 
                          href={selectedSubmission.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          📎 View Submitted File
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedSubmission.status === 'REJECTED_AI' && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">AI Feedback:</h4>
                    <p className="text-red-700">This submission has been flagged by our AI system for potential issues. Please review and resubmit if necessary.</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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