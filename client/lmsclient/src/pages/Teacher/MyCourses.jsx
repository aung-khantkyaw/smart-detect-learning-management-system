import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    const token = localStorage.getItem("accessToken");
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.id;
    
    if (!userId || !token) {
      console.error("No user ID or token found");
      setLoading(false);
      return;
    }
    
    console.log("Fetching courses for teacher ID:", userId);
    
    try {
      // Try teacher-specific endpoint first
      let offeringsData;
      try {
        const offeringsRes = await fetch(`http://localhost:3000/api/teachers/${userId}/course-offerings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        offeringsData = await offeringsRes.json();
        console.log("Teacher endpoint response:", offeringsData);
      } catch (teacherErr) {
        console.log("Teacher endpoint failed, trying fallback:", teacherErr);
        // Fallback: get all offerings and filter by teacherId
        const offeringsRes = await fetch("http://localhost:3000/api/course-offerings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allOfferingsData = await offeringsRes.json();
        if (allOfferingsData.status === "success") {
          const filteredOfferings = allOfferingsData.data.filter(offering => offering.teacherId === userId);
          offeringsData = { status: "success", data: filteredOfferings };
        } else {
          offeringsData = allOfferingsData;
        }
      }
      
      // Get additional data
      const [coursesRes, academicYearsRes] = await Promise.all([
        fetch("http://localhost:3000/api/courses", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/api/academic-years", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      const [coursesData, academicYearsData] = await Promise.all([
        coursesRes.json(), academicYearsRes.json()
      ]);
      
      console.log("Final API Responses:", { offeringsData, coursesData, academicYearsData });
      
      if (offeringsData.status === "success" && Array.isArray(offeringsData.data)) {
        const offerings = offeringsData.data;
        const allCourses = coursesData.status === "success" ? coursesData.data : [];
        const allAcademicYears = academicYearsData.status === "success" ? academicYearsData.data : [];
        
        // Enrich offerings with course and academic year data
        const enrichedCourses = offerings.map(offering => {
          const course = allCourses.find(c => c.id === offering.courseId);
          const academicYear = allAcademicYears.find(y => y.id === offering.academicYearId);
          
          return {
            ...offering,
            courseName: course?.title || 'Unknown Course',
            courseCode: course?.code || 'N/A',
            academicYear: academicYear?.name || 'N/A'
          };
        });
        
        console.log("Enriched courses:", enrichedCourses);
        setCourses(enrichedCourses);
      } else {
        console.log("No course offerings found or API error:", offeringsData);
        setCourses([]);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 My Courses</h1>
          <p className="text-gray-600">Manage your assigned courses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((course) => (
              <Link
                key={course.id}
                to={`/teacher/courses/${course.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    📖
                  </div>
                  <span className="text-xs text-gray-500">Course</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {course.courseName || 'Course Title'}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {course.courseCode || 'Course Code'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Academic Year: {course.academicYear || 'N/A'}</span>
                  <span className="text-blue-600 font-medium">Manage →</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses assigned</h3>
                <p className="mt-1 text-sm text-gray-500">You don't have any courses assigned yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}