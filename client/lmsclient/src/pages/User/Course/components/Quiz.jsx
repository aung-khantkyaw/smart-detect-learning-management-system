import React from 'react'

export default function Quiz() {

     const quizzes = [
    {
      id: 1,
      title: "Quiz 1: Introduction to Distributed Computing",
      description:
        "Test your knowledge on the basics of distributed computing and its concepts.",
      dueDate: "2025-08-25T23:59:00Z",
    },
    {
      id: 2,
      title: "Quiz 2: Parallel Algorithms",
      description:
        "Assess your understanding of parallel algorithms, speedup, and efficiency.",
      dueDate: "2025-09-01T23:59:00Z",
    },
    {
      id: 3,
      title: "Quiz 3: MPI Programming",
      description:
        "Evaluate your skills in MPI programming and message passing concepts.",
      dueDate: "2025-09-08T23:59:00Z",
    },
  ];

  return (
     <div className="max-w-6xl mx-auto p-6">
   

      {quizzes.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">
          No quizzes available at the moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col justify-between hover:shadow-xl transition"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {quiz.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                  {quiz.description}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                  Due Date: {new Date(quiz.dueDate).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition">
                  Start Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
