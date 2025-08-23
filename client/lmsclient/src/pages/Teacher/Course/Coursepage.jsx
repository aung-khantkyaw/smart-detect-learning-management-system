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



  useEffect(() => {
    fetchCourses();
  }, []);

 const fetchCourses = async () => {
    const res = await fetch("http://localhost:5000/api/courses");
    const data = await res.json();
    setCourses(data);
  };

  return (
    <div>

      <div>
      <h2 className="text-xl font-bold mb-4">Welcome Back accname</h2>



      <div className='ml-6 flex flex-wrap gap-4'>
        {/* {courses.map(course => ( */}
<div className="ml-6 flex flex-wrap gap-4">
      {courses.map((course) => (
        <div
          key={course.id}
          className="p-4 mb-4 rounded-xl bg-[#E0E7FF] shadow-lg"
        >
          <h3 className="text-xl text-gray-900    font-semibold mb-3">{course.title}</h3>

          {/* Placeholder image for now */}
          <img
            src={courseImages[course.code]} 
            alt={course.title}
            className="h-[40vh] w-full object-cover rounded-lg mb-4"
          />

          <Link
            to="courselist"
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
      ))}
    </div>


               
     


          
         
          
        {/* ))} */}
      </div>
    </div>
      
    </div>
  )
}
