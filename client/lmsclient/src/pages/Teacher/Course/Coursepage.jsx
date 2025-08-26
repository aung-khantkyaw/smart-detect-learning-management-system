import React from 'react'
import  { useEffect, useState } from 'react'

import { Link, Outlet ,useLocation } from "react-router-dom";
import science from '../../../assets/img/physics.png'
import math from '../../../assets/img/math.png'
export default function CoursePage() {

  const [courses, setCourses] = useState([]);

  
    const courseImages = {
    "CST-1442": science,
    "CST-1443": math,
  };

 const fetchCourses = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/courses", {
        headers: {
          "Authorization": `Bearer ${token}`, // 👈 correct format
        },
      });

      const data = await res.json();
      if (data.status === "success") {
        setCourses(data.data); // ✅ now courses array gets filled
      } else {
        console.error("Failed to fetch courses:", data.message);
        setCourses([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setCourses([]);
    }
  };

  // ✅ call fetchCourses when component mounts
  useEffect(() => {
    fetchCourses();
  }, []);

  return (
   <div>
      <h2 className="text-xl font-bold mb-4">Welcome Back accname</h2>

      <div className="ml-6 flex flex-wrap gap-4">
        {courses.length === 0 ? (
            <div className="flex w-full flex-col items-center justify-center h-screen">
      <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p>Loading ...</p>
    
    </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="p-4 mb-4 rounded-xl bg-[#E0E7FF] shadow-lg"
            >
              <h3 className="text-xl text-gray-900 font-semibold mb-3">
                {course.title}
              </h3>

              <img
                src={courseImages[course.code] || science} // fallback image
                alt={course.title}
                className="h-[40vh] w-full object-cover rounded-lg mb-4"
              />

              <Link
               to={`courses/${course.id}`}
                className="block w-full text-center px-4 py-3 
                          bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 
                          text-white font-medium rounded-lg shadow-md
                          transform transition-all duration-300 ease-in-out
                          hover:scale-105 hover:shadow-xl hover:from-indigo-500 hover:to-blue-600
                          active:scale-95"
              >
                🚀 View Course
              </Link>
            </div>
          ))
        )}

      </div>
    </div>
  )
}
