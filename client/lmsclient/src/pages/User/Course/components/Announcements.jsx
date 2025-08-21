import React from 'react'

export default function Announcements() {

     const announcements = [
    {
      id: "1",
      title: "Midterm Exam Schedule",
      description:
        "The midterm exam for CST-4211 will be held on August 25th at 10:00 AM in Room 301.",
      created_at: "2025-08-15T09:00:00Z",
    },
    {
      id: "2",
      title: "Assignment 2 Released",
      description:
        "Assignment 2 has been released. Please check the materials section for the problem statement and submission guidelines.",
      created_at: "2025-08-18T12:30:00Z",
    },

]



  return (
    <div className="max-w-6xl mx-auto p-6">
     

      {announcements.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">
          No announcements available at the moment.
        </p>
      ) : (
        <div className="space-y-6">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                {item.description}
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                Posted on: {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
