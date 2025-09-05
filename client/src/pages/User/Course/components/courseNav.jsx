import React from 'react'
import { NavLink } from "react-router-dom";

export default function courseoverviewnav() {
  const navItems = [
    { name: "Overview", path: "" },
    { name: "Materials", path: "materials" },
    { name: "Announcements", path: "announcements" },
    { name: "Chat", path: "chat" },
    { name: "Quizzes", path: "quiz" },
    { name: "Assignments", path: "assignments" },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 mt-6">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === ""}
              className={({ isActive }) =>
                `py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
