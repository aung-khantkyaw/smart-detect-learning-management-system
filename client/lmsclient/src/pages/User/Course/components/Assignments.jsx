import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../../lib/api";

export default function Assignments() {
  const { id } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    textAnswer: "",
  });
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, [id]);

  const fetchAssignments = async () => {
    try {
      const data = await api.get(`/assignments/course/${id}`);
      setAssignments(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));

    try {
      const data = await api.get(
        `/assignments/submissions/student/${userData.id}`
      );
      setSubmissions(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const openSubmissionModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionModal(true);
    setSubmissionData({ textAnswer: "" });
  };

  const showCustomAlert = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  const handleSubmit = async () => {
    if (!submissionData.textAnswer.trim()) {
      showCustomAlert(
        "error",
        "Validation Error",
        "Please enter your answer before submitting."
      );
      return;
    }

    const userData = JSON.parse(localStorage.getItem("userData"));

    const formData = new FormData();
    formData.append("studentId", userData.id);
    formData.append("textAnswer", submissionData.textAnswer);

    try {
      await api.postForm(
        `/assignments/${selectedAssignment.id}/submit`,
        formData
      );
      
      showCustomAlert(
        "success",
        "Success!",
        "Assignment submitted successfully!"
      );
    } catch (err) {
      console.error("Error submitting assignment:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Unknown error occurred";
      showCustomAlert("error", "Submission Failed", errorMessage);
    } finally {
      // Always close modal and reset form after submission attempt
      setShowSubmissionModal(false);
      setSubmissionData({ textAnswer: "" });
      
      // Refresh submissions to update UI state
      fetchSubmissions();
    }
  };

  const viewResult = (submission) => {
    setSelectedSubmission(submission);
    setShowResultModal(true);
  };

  const getSubmissionStatus = (assignmentId) => {
    return submissions.find((s) => s.assignmentId === assignmentId);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "Under Review";
      case "GRADED":
        return "Graded";
      case "REJECTED_AI":
        return "AI Flagged";
      default:
        return "Pending";
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
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Assignments
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Course Assignments
        </h2>

        <div className="border border-gray-200 bg-gray-50">
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-sm font-medium text-gray-900">
                No assignments available
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no assignments for this course yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {assignments.map((assignment) => {
                const submission = getSubmissionStatus(assignment.id);
                const isOverdue = new Date() > new Date(assignment.dueAt);

                return (
                  <div key={assignment.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {assignment.title}
                      </h3>
                      {submission && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            submission.status === "GRADED"
                              ? "bg-green-100 text-green-800"
                              : submission.status === "REJECTED_AI"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {getStatusText(submission.status)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {assignment.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span className={isOverdue ? "text-red-600" : ""}>
                          Due: {new Date(assignment.dueAt).toLocaleDateString()}
                        </span>
                        {submission && (
                          <span className="ml-4">
                            Submitted:{" "}
                            {new Date(
                              submission.submittedAt
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        {!submission && !isOverdue ? (
                          <button
                            onClick={() => openSubmissionModal(assignment)}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 hover:bg-green-700 text-white"
                          >
                            Submit
                          </button>
                        ) : submission && submission.status === "PENDING" && !isOverdue ? (
                          <button
                            onClick={() => openSubmissionModal(assignment)}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            Resubmit
                          </button>
                        ) : isOverdue && !submission ? (
                          <button
                            disabled
                            className="px-4 py-2 text-sm font-medium rounded-md bg-gray-300 text-gray-500 cursor-not-allowed"
                          >
                            Overdue
                          </button>
                        ) : null}

                        {submission && (
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white relative">
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold">
                  📝
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Submit Assignment</h3>
                  <p className="text-white/90 text-sm mt-1">
                    {selectedAssignment?.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(85vh-140px)]">
              {/* Assignment Details */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Assignment Details
                </h4>
                <p className="text-blue-800 text-sm">
                  {selectedAssignment?.description}
                </p>
                {selectedAssignment?.questionText && (
                  <div className="mt-3 p-3 bg-white rounded-lg border">
                    <p className="font-medium text-gray-700 mb-1">Question:</p>
                    <p className="text-gray-900">
                      {selectedAssignment.questionText}
                    </p>
                  </div>
                )}
              </div>

              {/* Answer Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    ✍️ Your Answer
                  </label>
                  <div className="relative">
                    <textarea
                      value={submissionData.textAnswer}
                      onChange={(e) =>
                        setSubmissionData({
                          ...submissionData,
                          textAnswer: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none shadow-sm text-gray-800 leading-relaxed"
                      rows="12"
                      placeholder="Write your detailed answer here... Be thorough and explain your reasoning step by step."
                    />
                    <div className="absolute bottom-4 right-4 flex items-center space-x-3">
                      <div className="text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border shadow-sm">
                        {
                          submissionData.textAnswer
                            .trim()
                            .split(/\s+/)
                            .filter((word) => word.length > 0).length
                        }{" "}
                        words
                      </div>
                      <div className="text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border shadow-sm">
                        {submissionData.textAnswer.length} characters
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Make sure to review your answer before submitting
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!submissionData.textAnswer.trim()}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Submit Assignment
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
              <h3 className="text-lg font-semibold text-gray-900">
                Submission Result
              </h3>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <p className="text-gray-900">
                  {getStatusText(selectedSubmission.status)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Submitted At
                </label>
                <p className="text-gray-900">
                  {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>
              </div>

              {selectedSubmission.aiScore && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    AI Score
                  </label>
                  <p className="text-gray-900">{selectedSubmission.aiScore}%</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Answer
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 border">
                  {selectedSubmission.textAnswer}
                </p>
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

      {/* Custom Alert */}
      {showAlert && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div
            className={`rounded-xl shadow-2xl border-l-4 p-4 max-w-md ${
              alertConfig.type === "success"
                ? "bg-green-50 border-green-500 text-green-800"
                : alertConfig.type === "error"
                ? "bg-red-50 border-red-500 text-red-800"
                : "bg-blue-50 border-blue-500 text-blue-800"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {alertConfig.type === "success" && (
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {alertConfig.type === "error" && (
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {alertConfig.type === "info" && (
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{alertConfig.title}</h4>
                <p className="text-sm mt-1 opacity-90">{alertConfig.message}</p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
