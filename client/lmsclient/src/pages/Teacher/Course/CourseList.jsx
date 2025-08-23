import React from 'react'
import { NavLink, Outlet } from "react-router-dom";
export default function CourseList() {


  const navItems = [
    { name: "Overview", path: "" },
    { name: "Materials", path: "materials" },
    { name: "Announcements", path: "announcements" },
    { name: "Chat", path: "chat" },
    { name: "Quizzes", path: "quiz" },
    { name: "Assignments", path: "assignments" },
  ];

  return ( 
    <>
        <div>
      <p className='text-md font-bold text-gray-600'>  <span className='text-blue-800'>Courses</span>  / CST-4242</p>

      <p className='mt-4 font-bold text-lg tracking-wide'>CST-4211 Distributed and Parallel Computing</p>
    </div>
    <nav className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-lg flex justify-center border-gray-200 dark:bg-gray-900 mt-6">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 md:rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.path === ""}
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded-sm md:p-0 ${
                      isActive
                        ? "text-white md:text-white md:border-b-2 md:border-white"
                        : "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-white dark:text-white md:dark:hover:text-white"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>

    <Outlet/>
</>
  )
}
