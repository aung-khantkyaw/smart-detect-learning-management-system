import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../../lib/api';

export default function Quiz() {
  const { id } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchQuizzes();
    fetchSubmissions();
  }, [id]);

  const fetchQuizzes = async () => {
    try {
      const data = await api.get(`/quizzes/course/${id}`);
      const quizList = Array.isArray(data) ? data : data.data || [];
      setQuizzes(quizList);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    const userData = JSON.parse(localStorage.getItem("userData") || '{}');
    
    try {
      const data = await api.get(`/quizzes/submissions/user/${userData.id}`);
      setSubmissions(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const isQuizSubmitted = (quizId) => {
    return submissions.some(s => s.quizId === quizId);
  };



  const startQuiz = async (quiz) => {
    try {
      // Fetch full quiz details with questions
      const fullQuiz = await api.get(`/quizzes/${quiz.id}`);
      setSelectedQuiz(fullQuiz);
      setQuizStarted(true);
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
    } catch (err) {
      console.error("Error fetching quiz details:", err);
    }
  };

  const handleAnswer = (questionId, answer, questionType) => {
    if (questionType === 'MULTIPLE_CHOICE') {
      // For multiple choice, handle array of selected options
      setAnswers(prev => {
        const currentAnswers = prev[questionId] || [];
        const isSelected = currentAnswers.includes(answer);
        
        if (isSelected) {
          // Remove from selection
          return {
            ...prev,
            [questionId]: currentAnswers.filter(id => id !== answer)
          };
        } else {
          // Add to selection
          return {
            ...prev,
            [questionId]: [...currentAnswers, answer]
          };
        }
      });
    } else if (questionType === 'SHORT_TEXT') {
      // For short text, store the text value
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
    } else {
      // For single choice, store single option ID
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    try {
      // Prepare answers in the format expected by backend
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
        const question = selectedQuiz.questions.find(q => q.id === questionId);
        
        if (question?.questionType === 'SHORT_TEXT') {
          return {
            questionId,
            shortTextAnswer: answer,
            selectedOptionIds: null
          };
        } else if (question?.questionType === 'MULTIPLE_CHOICE') {
          return {
            questionId,
            selectedOptionIds: Array.isArray(answer) ? answer : [answer],
            shortTextAnswer: null
          };
        } else {
          // SINGLE_CHOICE
          return {
            questionId,
            selectedOptionIds: Array.isArray(answer) ? answer : [answer],
            shortTextAnswer: null
          };
        }
      });
      
      await api.post(`/quizzes/${selectedQuiz.id}/submit`, {
        answers: formattedAnswers
      });
      
      setShowResults(true);
      fetchQuizzes();
      fetchSubmissions();
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert('Failed to submit quiz');
    }
  };

  const backToQuizzes = () => {
    setSelectedQuiz(null);
    setQuizStarted(false);
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Quiz Taking Interface
  if (quizStarted && selectedQuiz && !showResults) {
    const question = selectedQuiz.questions?.[currentQuestion];
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{selectedQuiz.title}</h1>
            <button onClick={backToQuizzes} className="text-gray-500 hover:text-gray-700">
              ← Back to Quizzes
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Question {currentQuestion + 1} of {selectedQuiz.questions?.length || 0}</span>
              <span>Time Remaining: 45:30</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / (selectedQuiz.questions?.length || 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {question && (
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">{question.prompt}</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {question.points} {question.points === 1 ? 'point' : 'points'}
                </span>
              </div>
              
              {question.questionType === 'SHORT_TEXT' ? (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value, question.questionType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter your answer here..."
                />
              ) : (
                <div className="space-y-3">
                  {question.options?.map((option, index) => {
                    const isSelected = question.questionType === 'MULTIPLE_CHOICE' 
                      ? (answers[question.id] || []).includes(option.id)
                      : answers[question.id] === option.id;
                    
                    return (
                      <label key={option.id} className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}>
                        <input
                          type={question.questionType === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                          name={`question-${question.id}`}
                          value={option.id}
                          checked={isSelected}
                          onChange={() => handleAnswer(question.id, option.id, question.questionType)}
                          className="mr-3"
                        />
                        <span className={isSelected ? 'text-blue-900 font-medium' : ''}>{option.optionText}</span>
                      </label>
                    );
                  })}
                  {question.questionType === 'MULTIPLE_CHOICE' && (
                    <p className="text-sm text-gray-500 mt-2">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Select all that apply
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <button 
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentQuestion === (selectedQuiz.questions?.length || 1) - 1 ? (
              <button 
                onClick={submitQuiz}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit Quiz
              </button>
            ) : (
              <button 
                onClick={nextQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results Interface
  if (showResults && selectedQuiz) {
    const totalQuestions = selectedQuiz.questions?.length || 0;
    const answeredQuestions = Object.keys(answers).length;
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Submitted Successfully!</h2>
            <p className="text-gray-600">Your answers have been recorded and will be graded automatically.</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{answeredQuestions}</div>
                <div className="text-sm text-gray-500">Questions Answered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{totalQuestions}</div>
                <div className="text-sm text-gray-500">Total Questions</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Your score will be calculated automatically and available in your submissions.</p>
            </div>
          </div>
          
          <button 
            onClick={backToQuizzes}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Quiz List Interface
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quizzes</h2>

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes available</h3>
          <p className="mt-1 text-sm text-gray-500">There are no quizzes for this course yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const now = new Date();
            const isOpen = (!quiz.openAt || now >= new Date(quiz.openAt)) && 
                          (!quiz.closeAt || now <= new Date(quiz.closeAt));
            const submitted = isQuizSubmitted(quiz.id);
            
            return (
              <div key={quiz.id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                  {submitted && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{quiz.instructions}</p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  {quiz.openAt && (
                    <div>Opens: {new Date(quiz.openAt).toLocaleDateString()}</div>
                  )}
                  {quiz.closeAt && (
                    <div>Closes: {new Date(quiz.closeAt).toLocaleDateString()}</div>
                  )}
                </div>
                
                <button 
                  onClick={() => startQuiz(quiz)}
                  disabled={!isOpen || submitted}
                  className={`w-full py-2 px-4 rounded-md transition ${
                    submitted 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isOpen 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {submitted ? 'Already Submitted' : isOpen ? 'Start Quiz' : 'Not Available'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
