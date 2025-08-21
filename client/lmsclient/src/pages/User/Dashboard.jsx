
import React ,{useState ,useEffect} from 'react'

import { NavLink } from "react-router-dom";

import { Link, Outlet ,useLocation } from "react-router-dom";
export default function Home() {
  const location = useLocation();

    const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/courses")
      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);

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
    LMS Management System
  </p>
</div>
        </li>
<li>
  <NavLink
                  to="/dashboard/course"
                  end
                  className={({ isActive }) =>
                    [
                      "flex items-center p-2 transition-colors duration-200 rounded-lg group",
                      (isActive || location.pathname === "/dashboard")
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700 text-gray-600"
                    ].join(" ")
                  }
                >
                  {/* ...icon and text... */}
                  <svg
                    className="w-5 h-5 transition duration-75 shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z"/>
                  </svg>
                  <span className="flex-1 transition-colors duration-200 ms-3 whitespace-nowrap">
                    Course
                  </span>
                </NavLink>

</li>

{/* <li>

  <a href="#"
     className="flex items-center p-2 transition-colors duration-200 rounded-lg hover:bg-gray-700 group">
  <svg className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"/>
               </svg>

    <span className="flex-1 text-gray-600 transition-colors duration-200 ms-3 whitespace-nowrap group-hover:text-white">
      Chat
    </span        
  </a>
</li> */}

<li>
  <a href="#"
     className="flex items-center p-2 transition-colors duration-200 rounded-lg hover:bg-gray-700 group">
  <svg 
  className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" 
  xmlns="http://www.w3.org/2000/svg" 
  fill="currentColor" 
  viewBox="0 0 24 24"
>
  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
</svg>

    <span className="flex-1 text-gray-600 transition-colors duration-200 ms-3 whitespace-nowrap group-hover:text-white">
      Profile
    </span>
      {/* <span class="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-white bg-blue-100 rounded-full dark:bg-blue-900 dark:text-white">3</span> */}
         
  </a>
</li>
<li>
  <a href="#"
     className="flex items-center p-2 transition-colors duration-200 rounded-lg hover:bg-gray-700 group">
 <svg 
  className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" 
  xmlns="http://www.w3.org/2000/svg" 
  fill="currentColor" 
  viewBox="0 0 24 24"
>
  <path d="M12 2a7 7 0 0 0-7 7v5H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2h-1V9a7 7 0 0 0-7-7zm0 18a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z"/>
</svg>

    <span className="flex-1 text-gray-600 transition-colors duration-200 ms-3 whitespace-nowrap group-hover:text-white">
      Notifications
    </span>
      {/* <span class="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-white bg-blue-100 rounded-full dark:bg-blue-900 dark:text-white">3</span> */}
         
  </a>
</li>
<li>
  <a href="#"
     className="flex items-center p-2 transition-colors duration-200 rounded-lg hover:bg-gray-700 group">
  <svg className="w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"/>
               </svg>

    <span className="flex-1 text-gray-600 transition-colors duration-200 ms-3 whitespace-nowrap group-hover:text-white">
      Log out
    </span>
  </a>
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
