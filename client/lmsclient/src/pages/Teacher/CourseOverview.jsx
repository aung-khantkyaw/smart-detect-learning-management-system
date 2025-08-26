import React, { useEffect, useState } from "react";
import { useParams, Outlet, NavLink } from "react-router-dom";

export default function CourseOverview() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    const token = localStorage.getItem("accessToken");
    
    try {
      const [offeringRes, coursesRes, academicYearsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/course-offerings`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/api/courses", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/api/academic-years", {
          headers: { Authorization: `Bearer ${token}` }
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
          
          setCourse({
            ...offering,
            courseName: courseInfo?.title || 'Unknown Course',
            courseCode: courseInfo?.code || 'N/A',
            courseDescription: courseInfo?.description || '',
            academicYear: academicYear?.name || 'N/A'
          });
        }
      }
    } catch (err) {
      console.error("Error fetching course details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Course Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.courseName}</h1>
              <p className="text-gray-600">{course.courseCode} • {course.academicYear}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            <NavLink
              to={`/teacher/courses/${id}`}
              end
              className={({ isActive }) =>
                `py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`
              }
            >
              Overview
            </NavLink>
            <NavLink
              to={`/teacher/courses/${id}/materials`}
              className={({ isActive }) =>
                `py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`
              }
            >
              Materials
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Outlet context={{ course }} />
      </div>
    </div>
  );
}