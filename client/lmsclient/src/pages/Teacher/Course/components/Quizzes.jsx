import React ,{useState,useEffect} from 'react';

export default function TeacherDashboard() {

   const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const fetchQuizzes = async () => {
    const res = await fetch("http://localhost:5000/api/quizzes");
    const data = await res.json();
    setQuizzes(data);
  };

  const fetchQuestions = async (quizId) => {
    const res = await fetch(`/api/quizzes/${quizId}/questions`);
    const data = await res.json();
    setQuestions(data);
  };

  const fetchSubmissions = async (quizId) => {
    const res = await fetch(`/api/quizzes/${quizId}/submissions`);
    const data = await res.json();
    setSubmissions(data);
  };

  useEffect(() => { fetchQuizzes(); }, []);

  return (
     <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

      {/* Quizzes Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quizzes</h2>
        <div className="space-y-4">
          {quizzes.map((q) => (
            <div key={q.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{q.title}</h3>
                <p className="text-gray-500">{q.description}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => fetchQuestions(q.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  View Questions
                </button>
                <button
                  onClick={() => fetchSubmissions(q.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  View Submissions
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Questions Section */}
      {questions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Questions</h2>
          <ul className="bg-white p-4 rounded-lg shadow-md space-y-2">
            {questions.map((q) => (
              <li key={q.id} className="border-b last:border-b-0 pb-2">
                {q.question_text} <span className="text-sm text-gray-500">({q.question_type})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submissions Section */}
      {submissions.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Submissions</h2>
          <ul className="bg-white p-4 rounded-lg shadow-md space-y-2">
            {submissions.map((s) => (
              <li key={s.id} className="border-b last:border-b-0 pb-2 flex justify-between">
                <span>{s.student_name}</span>
                <span className="font-semibold">Score: {s.score}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
