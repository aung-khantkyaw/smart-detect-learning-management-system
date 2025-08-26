import React from 'react'

export default function Materials() {
    const materials = [
      {
        id: "1",
        title: "Distributed Computing Lecture Notes",
        description:
          "Introduction to distributed computing, architectures, and communication protocols.",
        file_url: "#",
        created_at: "2025-08-20T10:00:00Z",
      },
      {
        id: "2",
        title: "Parallel Algorithms PDF",
        description:
          "A comprehensive guide to parallel algorithms, scheduling, and efficiency.",
        file_url: "#",
        created_at: "2025-08-18T12:30:00Z",
      },
    
  
  ]
  return (
    <>
          <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Materials
      </h1>

      {materials.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">
          No materials available at the moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col justify-between hover:shadow-xl transition"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                  {item.description || "No description provided."}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                  Created at: {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4 flex space-x-2">
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition"
                >
                  View
                </a>
                <a
                  href={item.file_url}
                  download
                  className="flex-1 text-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500  hover:bg-green-600 text-white py-2 px-4 rounded-md transition"
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  )
}
