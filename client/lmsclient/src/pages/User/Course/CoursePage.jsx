import React from 'react'
import  { useEffect, useState } from 'react'

import { Link, Outlet ,useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";
import science from '../../../assets/img/physics.png'
import math from '../../../assets/img/math.png'
export default function CoursePage() {

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  
    const courseImages = {
    "CST-1442": science,
    "CST-1443": math,
  };

 const fetchCourses = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("No token found in localStorage");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/courses", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.status === "success") {
        setCourses(data.data);
      } else {
        console.error("Failed to fetch courses:", data.message);
        setCourses([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ call fetchCourses when component mounts
  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500"></div>
          <p className="text-gray-300">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">My Courses</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((course) => (
              <Link
                key={course.id}
                to={`courses/${course.id}`}
                className="border border-gray-200 p-6 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Course</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h3>
                
                <p className="text-blue-600 mb-4 font-medium">
                  {course.code}
                </p>
                
                <div className="flex items-center justify-between">
                 
                  <div className="flex items-center gap-2 text-blue-600">
                    <span className="font-medium">View</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="border border-gray-200 p-12 bg-gray-50">
                <div className="bg-blue-100 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No courses available</h3>
                <p className="text-gray-600">There are no courses available at the moment.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}