import React from 'react'
import { Link } from 'react-router';
export default function Chat() {
    const courses = [
    { id: "db101", title: "Introduction to Databases" },
    { id: "react201", title: "Web Development with React" },
    { id: "ai301", title: "AI & Machine Learning Basics" },
  ];

  return (
       <div className="p-6  min-h-screen">
      <h1 className="text-2xl font-bold mb-6">💬 Course Chats</h1>
      <ul className="space-y-4">
        {courses.map((c) => (
          <li
            key={c.id}
            className="p-4 bg-white shadow rounded flex justify-between items-center"
          >
            <span>{c.title}</span>
            <Link
              to={`/dashboard/chat/${c.id}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
            >
              Enter Chat
            </Link>
          </li>
        ))}
      </ul>
    </div>

  )
}
