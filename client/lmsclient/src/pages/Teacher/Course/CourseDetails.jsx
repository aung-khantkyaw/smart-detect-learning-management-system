import React, { useState, useEffect } from 'react'
import TeacherCourseNav from './components/TeacherCourseNav.jsx'
import { Outlet, useParams } from "react-router-dom";

export default function TeacherCourseDetails() {
  const { id } = useParams(); // get course offering ID from URL
  const [courseOffering, setCourseOffering] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseOffering = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const [offeringRes, coursesRes, academicYearsRes] = await Promise.all([
          fetch(`http://localhost:3000/api/course-offerings`, {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch("http://localhost:3000/api/courses", {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch("http://localhost:3000/api/academic-years", {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        const [offeringsData, coursesData, academicYearsData] = await Promise.all([
          offeringRes.json(), coursesRes.json(), academicYearsRes.json()
        ]);

        if (offeringsData.status === "success") {
          const offering = offeringsData.data.find(o => o.id === id);
          const allCourses = coursesData.status === "success" ? coursesData.data : [];
          const allAcademicYears = academicYearsData.status === "success" ? academicYearsData.data : [];
          
          if (offering) {
            const courseInfo = allCourses.find(c => c.id === offering.courseId);
            const academicYear = allAcademicYears.find(y => y.id === offering.academicYearId);
            
            setCourseOffering({
              ...offering,
              courseTitle: courseInfo?.title || 'Unknown Course',
              courseCode: courseInfo?.code || 'N/A',
              courseDescription: courseInfo?.description || '',
              academicYear: academicYear?.name || 'N/A'
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseOffering();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Course Details</span>
          </div>
          
          {courseOffering ? (
            <div className="border-l-4 border-blue-600 pl-4 py-2">
              <h1 className="text-xl font-bold text-gray-900">{courseOffering.courseTitle}</h1>
              <p className="text-blue-600 font-medium">{courseOffering.courseCode}</p>
              <p className="text-gray-600">{courseOffering.academicYear}</p>
            </div>
          ) : (
            <div className="border border-gray-200 p-4 bg-gray-50">
              <p className="text-gray-600">Course offering not found</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Teacher Course Nav Section */}
      <TeacherCourseNav />
      
      <Outlet context={{ courseOffering }} />
    </>
  )
}