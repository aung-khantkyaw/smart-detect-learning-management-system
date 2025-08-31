import React from 'react'
import { NavLink, useParams } from 'react-router-dom'

export default function TeacherCourseNav() {
  const { id } = useParams();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex space-x-8">
          <NavLink
            to={`/teacher/courses/${id}`}
            end
            className={({ isActive }) =>
              `py-4 px-1 border-b-2 font-medium text-sm ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to={`/teacher/courses/${id}/materials`}
            className={({ isActive }) =>
              `py-4 px-1 border-b-2 font-medium text-sm ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }
          >
            Materials
          </NavLink>
          <NavLink
            to={`/teacher/courses/${id}/students`}
            className={({ isActive }) =>
              `py-4 px-1 border-b-2 font-medium text-sm ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }
          >
            Students
          </NavLink>
          <NavLink
            to={`/teacher/courses/${id}/announcements`}
            className={({ isActive }) =>
              `py-4 px-1 border-b-2 font-medium text-sm ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }
          >
            Announcements
          </NavLink>
          <NavLink
            to={`/teacher/courses/${id}/chat`}
            className={({ isActive }) =>
              `py-4 px-1 border-b-2 font-medium text-sm ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }
          >
            Chat Room
          </NavLink>
          <NavLink
            to={`/teacher/courses/${id}/quizzes`}
            className={({ isActive }) =>
              `py-4 px-1 border-b-2 font-medium text-sm ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }
          >
            Quizzes
          </NavLink>
          <NavLink
            to={`/teacher/courses/${id}/assignments`}
            className={({ isActive }) =>
              `py-4 px-1 border-b-2 font-medium text-sm ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }
          >
            Assignments
          </NavLink>
        </nav>
      </div>
    </div>
  )
}