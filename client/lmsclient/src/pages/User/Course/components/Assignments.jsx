import React, {useState} from 'react'

export default function Assignments() {


  const assignments = [
    {
      id: 1,
      title: "Assignment 1: Distributed Systems Overview",
      description:
        "Read the lecture notes and answer the questions on distributed system fundamentals.",
      dueDate: "2025-08-28T23:59:00Z",
      file_url: "#",
      submitted: false,
      result: null,
      aiFeedback: null,
    },
    {
      id: 2,
      title: "Assignment 2: Parallel Algorithms Implementation",
      description:
        "Implement basic parallel algorithms in C/C++ and submit your code files.",
      dueDate: "2025-09-05T23:59:00Z",
      file_url: "#",
      submitted: true,
      result: "85/100",
      aiFeedback:
        "Good implementation! Consider optimizing your loops for better performance.",
    },
    {
      id: 3,
      title: "Assignment 3: MPI Programming Exercises",
      description:
        "Complete the MPI exercises provided in the materials section and submit your results.",
      dueDate: "2025-09-12T23:59:00Z",
      file_url: "#",
      submitted: false,
      result: null,
      aiFeedback: null,
    },
  ];



  
     const [assignmentList, setAssignmentList] = useState(assignments);

  const handleSubmit = (id) => {
    const updated = assignmentList.map((a) =>
      a.id === id ? { ...a, submitted: true } : a
    );
    setAssignmentList(updated);
  };


  return (
     <div className="max-w-6xl mx-auto p-6">
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignmentList.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col justify-between hover:shadow-xl transition"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                {item.description}
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                Due Date: {new Date(item.dueDate).toLocaleDateString()}
              </p>
              {item.submitted && (
                <>
                  <p className="text-green-500 mt-2 font-medium">
                    Submitted
                  </p>
                  {item.result && (
                    <p className="text-yellow-500 mt-1">Result: {item.result}</p>
                  )}
                  {item.aiFeedback && (
                    <p className="text-blue-400 mt-1">
                      AI Feedback: {item.aiFeedback}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
              {!item.submitted && (
                <button
                  onClick={() => handleSubmit(item.id)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition"
                >
                  Submit Assignment
                </button>
              )}
              {item.submitted && (
                <>
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition">
                    View Result
                  </button>
                  <button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition">
                    AI Feedback
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
