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
    <div className=" mx-auto p-2">
      {course ? (
        <>
          <h1 className="text-xl font-bold ">{course.title}</h1>
          <p>Code: {course.code}</p>
         
        </>
      ) : (
        <div>Course not found</div>
      )}
    </div>
    {/* Course Overview Nav Section */}
    <CourseNav/>
    

    <Outlet/>



    </>
  )
}
