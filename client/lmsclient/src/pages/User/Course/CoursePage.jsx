import React from 'react'
import  { useEffect, useState } from 'react'
import science from '../../../assets/img/physics.png'
export default function CoursePage() {

   const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);


  return (
    <div>

      <div>
      <h2 className="text-xl font-bold mb-4">Welcome Back accname</h2>
      <div className='ml-6 flex flex-wrap gap-4'>
        {/* {courses.map(course => ( */}
          
            <div className="p-4 mb-4 rounded-xl bg-[#E3DE61]">
              <h3 className="text-lg font-semibold">Course Name</h3>
             <img src={science} className='h-[40vh]'></img>
              <button className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                View Course
              </button>
            </div>
            <div className="p-4 mb-4 rounded-xl bg-[#E3DE61]">
              <h3 className="text-lg font-semibold">Course Name</h3>
             <img src={science} className='h-[40vh]'></img>
              <button className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                View Course
              </button>
            </div>
            <div className="p-4 mb-4 rounded-xl bg-[#E3DE61]">
              <h3 className="text-lg font-semibold">Course Name</h3>
             <img src={science} className='h-[40vh]'></img>
              <button className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                View Course
              </button>
            </div>
          
         
          
        {/* ))} */}
      </div>
    </div>
      
    </div>
  )
}
