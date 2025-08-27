import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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
    const token = localStorage.getItem("accessToken");
    
    try {
      // First get offering ID from course ID
      const offeringsRes = await fetch(`http://localhost:3000/api/course-offerings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const offeringsData = await offeringsRes.json();
      const offerings = offeringsData.status === "success" ? offeringsData.data : [];
      const offering = offerings.find(o => o.courseId === id);
      
      if (!offering) {
        setQuizzes([]);
        return;
      }
      
      // Fetch quizzes for this offering
      const res = await fetch(`http://localhost:3000/api/quizzes/offering/${offering.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setQuizzes(Array.isArray(data) ? data : data.data || []);
      } else {
        setQuizzes([]);
      }
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    const token = localStorage.getItem("accessToken");
    const userData = JSON.parse(localStorage.getItem("userData"));
    
    try {
      const res = await fetch(`http://localhost:3000/api/quiz-submissions/student/${userData.id}`, {
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

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
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

  const submitQuiz = () => {
    setShowResults(true);
    // Here you would normally submit to backend
  };

  const backToQuizzes = () => {
    setSelectedQuiz(null);
    setQuizStarted(false);
    setShowResults(false);
  };

  const getSubmissionStatus = (quizId) => {
    const submission = submissions.find(s => s.quizId === quizId);
    return submission ? { submitted: true, score: submission.score, status: submission.status } : { submitted: false };
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">{question.prompt}</h3>
              
              <div className="space-y-3">
                {question.options?.map((option, index) => (
                  <label key={option.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={() => handleAnswer(question.id, option.id)}
                      className="mr-3"
                    />
                    <span>{option.optionText}</span>
                  </label>
                ))}
              </div>
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
    const score = Math.round((answeredQuestions / totalQuestions) * 100);
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
            <p className="text-gray-600">You have successfully submitted your quiz.</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{score}%</div>
                <div className="text-sm text-gray-500">Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{answeredQuestions}</div>
                <div className="text-sm text-gray-500">Answered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{totalQuestions}</div>
                <div className="text-sm text-gray-500">Total Questions</div>
              </div>
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
            const submission = getSubmissionStatus(quiz.id);
            const isOpen = new Date() >= new Date(quiz.openAt) && new Date() <= new Date(quiz.closeAt);
            
            return (
              <div key={quiz.id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                  {submission.submitted && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{quiz.instructions}</p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  {quiz.openAt && (
                    <div>Opens: {new Date(quiz.openAt).toLocaleString()}</div>
                  )}
                  {quiz.closeAt && (
                    <div>Closes: {new Date(quiz.closeAt).toLocaleString()}</div>
                  )}
                </div>
                
                {submission.submitted ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Your Score:</span>
                      <span className="font-medium">{submission.score || 'Pending'}%</span>
                    </div>
                    <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md">
                      View Results
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => startQuiz(quiz)}
                    disabled={!isOpen}
                    className={`w-full py-2 px-4 rounded-md transition ${
                      isOpen 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isOpen ? 'Start Quiz' : 'Not Available'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
