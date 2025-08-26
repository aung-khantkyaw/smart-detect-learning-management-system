
import React ,{useState ,useEffect} from 'react'

import { NavLink } from "react-router-dom";

import { Link, Outlet ,useLocation } from "react-router-dom";
export default function Home() {
  const location = useLocation();


  const handleLogout = () => {
  // Clear localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  // Redirect to login page
  window.location.href = "/login";
};
  
  return (
    <>
    <div>   
      {/* logo navigation container */}
        


           <div className="">
       
<aside id="cta-button-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
   <div className="h-full px-3 py-4 overflow-y-auto  border-r-4 ">
      <ul className="space-y-2 font-medium  ">
        <li>
           <div className="flex items-center space-x-3">
  <p className="mb-6 ml-4 text-xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text">
    SD - LMS
  </p>
</div>
        </li>

        
<li>
  <NavLink
                  to="/admin/departments"
                  className={({ isActive }) =>
                    [
                      "flex items-center p-2 transition-colors duration-200 rounded-lg group",
                      isActive
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700 text-gray-600"
                    ].join(" ")
                  }
                >
                  <svg 
                    className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <span className="flex-1 transition-colors duration-200 ms-3 whitespace-nowrap">
                    Departments
                  </span>
                </NavLink>
</li>

<li>
  <NavLink
                  to="/admin/positions"
                  className={({ isActive }) =>
                    [
                      "flex items-center p-2 transition-colors duration-200 rounded-lg group",
                      isActive
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700 text-gray-600"
                    ].join(" ")
                  }
                >
                  <svg 
                    className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"/>
                  </svg>
                  <span className="flex-1 transition-colors duration-200 ms-3 whitespace-nowrap">
                    Positions
                  </span>
                </NavLink>
</li>

<li>
  <NavLink
                  to="/admin/academic-years"
                  className={({ isActive }) =>
                    [
                      "flex items-center p-2 transition-colors duration-200 rounded-lg group",
                      isActive
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700 text-gray-600"
                    ].join(" ")
                  }
                >
                  <svg 
                    className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span className="flex-1 transition-colors duration-200 ms-3 whitespace-nowrap">
                    Academic Years
                  </span>
                </NavLink>
</li>

<li>
  <NavLink
                  to="/admin/majors"
                  className={({ isActive }) =>
                    [
                      "flex items-center p-2 transition-colors duration-200 rounded-lg group",
                      isActive
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700 text-gray-600"
                    ].join(" ")
                  }
                >
                  <svg 
                    className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                  </svg>
                  <span className="flex-1 transition-colors duration-200 ms-3 whitespace-nowrap">
                    Majors
                  </span>
                </NavLink>
</li>


<li>
  <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    [
                      "flex items-center p-2 transition-colors duration-200 rounded-lg group",
                      (isActive || location.pathname === "/admin")
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700 text-gray-600"
                    ].join(" ")
                  }
                >
                  <svg 
                    className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span className="flex-1 transition-colors duration-200 ms-3 whitespace-nowrap">
                    User Management
                  </span>
                </NavLink>
</li>

<li>
  <NavLink
                  to="/admin/courses"
                  className={({ isActive }) =>
                    [
                      "flex items-center p-2 transition-colors duration-200 rounded-lg group",
                      isActive
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700 text-gray-600"
                    ].join(" ")
                  }
                >
                  <svg 
                    className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  <span className="flex-1 transition-colors duration-200 ms-3 whitespace-nowrap">
                    Course Management
                  </span>
                </NavLink>
</li>

<li>
  <NavLink
                  to="/admin/course-offerings"
                  className={({ isActive }) =>
                    [
                      "flex items-center p-2 transition-colors duration-200 rounded-lg group",
                      isActive
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700 text-gray-600"
                    ].join(" ")
                  }
                >
                  <svg 
                    className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                  <span className="flex-1 transition-colors duration-200 ms-3 whitespace-nowrap">
                    Course Offerings
                  </span>
                </NavLink>
</li>

<li>
  <NavLink
                  to="/admin/enrollments"
                  className={({ isActive }) =>
                    [
                      "flex items-center p-2 transition-colors duration-200 rounded-lg group",
                      isActive
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700 text-gray-600"
                    ].join(" ")
                  }
                >
                  <svg 
                    className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
                  </svg>
                  <span className="flex-1 transition-colors duration-200 ms-3 whitespace-nowrap">
                    Enrollments
                  </span>
                </NavLink>
</li>

<li>
  <NavLink
                  to="/admin/announcements"
                  className={({ isActive }) =>
                    [
                      "flex items-center p-2 transition-colors duration-200 rounded-lg group",
                      isActive
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700 text-gray-600"
                    ].join(" ")
                  }
                >
                  <svg 
                    className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
                  </svg>
                  <span className="flex-1 transition-colors duration-200 ms-3 whitespace-nowrap">
                    Announcements
                  </span>
                </NavLink>
</li>

<li>
  <NavLink
                  to="/admin/chat-rooms"
                  className={({ isActive }) =>
                    [
                      "flex items-center p-2 transition-colors duration-200 rounded-lg group",
                      isActive
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700 text-gray-600"
                    ].join(" ")
                  }
                >
                  <svg 
                    className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <span className="flex-1 transition-colors duration-200 ms-3 whitespace-nowrap">
                    Chat Rooms
                  </span>
                </NavLink>
</li>




<li>
 <NavLink
        onClick={handleLogout}
        className="flex items-center w-full p-2 transition-colors duration-200 rounded-lg hover:bg-gray-700 group"
      >
        <svg
          className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 18 16"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
          />
        </svg>

        <span className="flex-1 text-gray-600 transition-colors duration-200 ms-3 whitespace-nowrap group-hover:text-white">
          Logout
        </span>
      </NavLink>
</li>

      </ul>
      
   </div>
</aside>

      <div className="p-4 sm:ml-64">
                  <Outlet/>
      </div>
</div>

  



</div>
    </>
  )
}
