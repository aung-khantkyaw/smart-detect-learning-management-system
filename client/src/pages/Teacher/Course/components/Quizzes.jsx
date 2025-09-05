import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../../lib/api";
import ConfirmDeleteModal from "../../../../components/ConfirmDeleteModal";

export default function Quizzes() {
  const { id } = useParams(); // course offering ID
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionType: 'SINGLE_CHOICE',
    prompt: '',
    points: 1,
    options: [{ optionText: '', isCorrect: false }]
  });
  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    openAt: "",
    closeAt: "",
    questions: []
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, [id]);

  const fetchQuizzes = async () => {
    try {
      const data = await api.get(`/quizzes/offering/${id}`);
      console.log("Quizzes response:", data);
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setQuizzes(list);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }
    
    const requestBody = {
      title: formData.title,
      instructions: formData.instructions || "",
      openAt: formData.openAt || null,
      closeAt: formData.closeAt || null,
      questions: formData.questions || []
    };

    try {
      const result = await api.post(`/quizzes/offering/${id}`, requestBody);
      console.log("Quiz created:", result);
      setShowCreateModal(false);
      setFormData({ title: "", instructions: "", openAt: "", closeAt: "", questions: [] });
      fetchQuizzes();
      
      // Success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Quiz created successfully!
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 4000);
    } catch (err) {
      console.error("Create quiz error:", err);
      alert("Failed to create quiz: " + err.message);
    }
  };

  const handleDeleteQuiz = (quiz) => {
    setConfirmTarget(quiz);
    setDeleteError("");
    setShowConfirm(true);
  };

  const fetchSubmissions = async (quiz) => {
    try {
      const data = await api.get(`/quizzes/${quiz.id}/submissions`);
      setSubmissions(Array.isArray(data) ? data : data?.data || []);
      setSelectedQuiz(quiz);
      setShowSubmissionsModal(true);
    } catch (err) {
      console.error("Fetch submissions error:", err);
      alert("Failed to fetch submissions");
    }
  };

  const fetchQuizQuestions = async (quiz) => {
    try {
      const data = await api.get(`/quizzes/${quiz.id}`);
      setQuestions(data.questions || []);
      setSelectedQuiz(quiz);
      setShowQuestionsModal(true);
    } catch (err) {
      console.error("Fetch questions error:", err);
      alert("Failed to fetch questions");
    }
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, { optionText: '', isCorrect: false }]
    });
  };

  const updateOption = (index, field, value) => {
    const updatedOptions = newQuestion.options.map((option, i) => 
      i === index ? { ...option, [field]: value } : option
    );
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleAddQuestion = () => {
    if (!newQuestion.prompt.trim()) {
      alert("Please enter a question prompt");
      return;
    }
    
    if (newQuestion.options.every(opt => !opt.optionText.trim())) {
      alert("Please add at least one option with text");
      return;
    }
    
    // Add question to local state (will be saved when quiz is created/updated)
    const questionToAdd = {
      questionType: newQuestion.questionType,
      prompt: newQuestion.prompt,
      points: newQuestion.points,
      options: newQuestion.options.filter(opt => opt.optionText.trim())
    };
    
    setQuestions([...questions, questionToAdd]);
    
    // Reset form
    setNewQuestion({
      questionType: 'SINGLE_CHOICE',
      prompt: '',
      points: 1,
      options: [{ optionText: '', isCorrect: false }]
    });
    
    // Success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Question added to quiz!
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Management</h1>
            <p className="text-gray-600">Create and manage quizzes for your course</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Quiz
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Quizzes ({quizzes.length})
            </h3>
          </div>
          
          {quizzes.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {quizzes.map((quiz) => {
                const now = new Date();
                const isActive = (!quiz.openAt || now >= new Date(quiz.openAt)) && 
                               (!quiz.closeAt || now <= new Date(quiz.closeAt));
                
                return (
                  <div key={quiz.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isActive ? '🟢 Active' : '⭕ Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{quiz.instructions || 'No instructions provided'}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Created: {new Date(quiz.createdAt).toLocaleDateString()}
                          </div>
                          {quiz.openAt && (
                            <div className="flex items-center gap-1 text-green-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Opens: {new Date(quiz.openAt).toLocaleDateString()}
                            </div>
                          )}
                          {quiz.closeAt && (
                            <div className="flex items-center gap-1 text-red-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Closes: {new Date(quiz.closeAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchQuizQuestions(quiz)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Questions
                        </button>
                        <button
                          onClick={() => fetchSubmissions(quiz)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Submissions
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
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
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first quiz.</p>
              </div>
            </div>
          )}
        </div>

        {/* Create Quiz Modal */}
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
                  <h3 className="text-2xl font-bold">Create New Quiz</h3>
                  <p className="text-white/80 text-sm mt-1">Design an interactive quiz for your students</p>
                </div>
              </div>
              
              <form onSubmit={handleCreateQuiz} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">📚 Quiz Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    placeholder="Enter quiz title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">📋 Instructions</label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    rows="3"
                    placeholder="Provide instructions for students..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">🕐 Open At</label>
                    <input
                      type="datetime-local"
                      value={formData.openAt}
                      onChange={(e) => setFormData({...formData, openAt: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">🕐 Close At</label>
                    <input
                      type="datetime-local"
                      value={formData.closeAt}
                      onChange={(e) => setFormData({...formData, closeAt: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-6">
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
                    Create Quiz
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Submissions Modal */}
      {showSubmissionsModal && selectedQuiz && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Quiz Submissions - {selectedQuiz.title}
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submissions.map((submission) => (
                        <tr key={submission.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {submission.studentName || 'Unknown Student'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {submission.score ? `${submission.score}%` : 'Not graded'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              submission.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                              submission.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Not submitted'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-sm">No submissions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Questions Modal */}
      {showQuestionsModal && selectedQuiz && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Edit Questions - {selectedQuiz.title}
                </h3>
                <button
                  onClick={() => setShowQuestionsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Existing Questions */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Questions ({questions.length})</h4>
                {questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id || `question-${index}`} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">Q{index + 1}: {question.prompt}</h5>
                            <p className="text-sm text-gray-500 mt-1">Type: {question.questionType} | Points: {question.points}</p>
                            {question.options && question.options.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Options:</p>
                                <ul className="mt-1 space-y-1">
                                  {question.options.map((option, optIndex) => (
                                    <li key={`option-${index}-${optIndex}`} className={`text-sm ${
                                      option.isCorrect ? 'text-green-600 font-medium' : 'text-gray-600'
                                    }`}>
                                      {option.isCorrect ? '✓' : '○'} {option.optionText}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No questions added yet</p>
                )}
              </div>

              {/* Add New Question */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Question</h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                      <select
                        value={newQuestion.questionType}
                        onChange={(e) => setNewQuestion({...newQuestion, questionType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="SINGLE_CHOICE">Single Choice</option>
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                      <input
                        type="number"
                        min="1"
                        value={newQuestion.points}
                        onChange={(e) => setNewQuestion({...newQuestion, points: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Prompt</label>
                    <textarea
                      value={newQuestion.prompt}
                      onChange={(e) => setNewQuestion({...newQuestion, prompt: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter your question here..."
                    />
                  </div>
                  
                  {(
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Answer Options</label>
                        <button
                          onClick={addOption}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          + Add Option
                        </button>
                      </div>
                      <div className="space-y-2">
                        {newQuestion.options.map((option, optionIndex) => (
                          <div key={`new-option-${optionIndex}`} className="flex items-center space-x-2">
                            <input
                              type={newQuestion.questionType === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                              name="correctAnswer"
                              checked={option.isCorrect}
                              onChange={(e) => {
                                if (newQuestion.questionType === 'SINGLE_CHOICE') {
                                  // For single choice, uncheck all others
                                  const updatedOptions = newQuestion.options.map((opt, i) => ({
                                    ...opt,
                                    isCorrect: i === optionIndex ? e.target.checked : false
                                  }));
                                  setNewQuestion({...newQuestion, options: updatedOptions});
                                } else {
                                  updateOption(optionIndex, 'isCorrect', e.target.checked);
                                }
                              }}
                              className="h-4 w-4 text-blue-600"
                            />
                            <input
                              type="text"
                              value={option.optionText}
                              onChange={(e) => updateOption(optionIndex, 'optionText', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            {newQuestion.options.length > 1 && (
                              <button
                                onClick={() => {
                                  const updatedOptions = newQuestion.options.filter((_, i) => i !== optionIndex);
                                  setNewQuestion({...newQuestion, options: updatedOptions});
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleAddQuestion}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Add Question
                    </button>
                    <button
                      onClick={async () => {
                        if (questions.length === 0) {
                          alert("Please add at least one question before saving");
                          return;
                        }
                        
                        try {
                          // Delete the existing quiz
                          await api.del(`/quizzes/${selectedQuiz.id}`);
                          
                          // Create new quiz with questions
                          await api.post(`/quizzes/offering/${id}`, {
                            title: selectedQuiz.title,
                            instructions: selectedQuiz.instructions,
                            openAt: selectedQuiz.openAt,
                            closeAt: selectedQuiz.closeAt,
                            questions: questions
                          });
                          
                          setShowQuestionsModal(false);
                          setQuestions([]);
                          fetchQuizzes();
                          
                          // Success notification
                          const notification = document.createElement('div');
                          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                          notification.innerHTML = `
                            <div class="flex items-center">
                              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              Questions saved successfully!
                            </div>
                          `;
                          document.body.appendChild(notification);
                          setTimeout(() => notification.remove(), 4000);
                        } catch (err) {
                          console.error("Save questions error:", err);
                          alert("Failed to save questions: " + err.message);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Questions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={showConfirm}
        title="Delete Quiz"
        message={confirmTarget ? `This will permanently delete quiz "${confirmTarget.title}" and all its questions and submissions.` : ""}
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
            await api.del(`/quizzes/${confirmTarget.id}`);
            console.log("Quiz deleted successfully");
            setShowConfirm(false);
            setConfirmTarget(null);
            setDeleting(false);
            fetchQuizzes();
          } catch (err) {
            console.error(err);
            setDeleteError(err.message || "Delete failed");
            setDeleting(false);
          }
        }}
      />
      </div>
    </div>
  );
}