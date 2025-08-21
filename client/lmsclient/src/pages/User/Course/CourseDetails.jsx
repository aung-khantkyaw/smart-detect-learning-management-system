import React from 'react'
import CourseNav from './components/courseNav.jsx'
import { Link, Outlet } from "react-router-dom";

export default function CourseOverview() {
  return (
    <>
    <div>
      <p className='text-md font-bold text-gray-600'>  <span classNameName='text-blue-800'>Courses</span>  / CST-4242</p>

      <p className='mt-4 font-bold text-lg tracking-wide'>CST-4211 Distributed and Parallel Computing</p>
    </div>
    {/* Course Overview Nav Section */}
    <CourseNav/>
    

    <Outlet/>



    </>
  )
}
