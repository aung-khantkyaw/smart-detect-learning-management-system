import React, { useState, useEffect } from 'react'
import CourseNav from './components/courseNav.jsx'
import { Link, Outlet } from "react-router-dom";
import { useParams } from "react-router-dom";

export default function CourseOverview() {

   const { id } = useParams(); // get course ID from URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await fetch(`http://localhost:3000/api/courses/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.status === "success") setCourse(data.data);
        else console.error(data.message);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);
  
  return (
    <>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Course Details</span>
          </div>
          
          {course ? (
            <div className="border-l-4 border-blue-600 pl-4 py-2">
              <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-blue-600 font-medium">{course.code}</p>
              <p className="text-gray-600">{course.description || 'No description available'}</p>
            </div>
          ) : (
            <div className="border border-gray-200 p-4 bg-gray-50">
              <p className="text-gray-600">Course not found</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Course Nav Section */}
      <CourseNav />
      
      <Outlet context={{ course }} />
    </>
  )
}