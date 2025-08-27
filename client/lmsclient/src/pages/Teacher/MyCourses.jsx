import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, GraduationCap } from "lucide-react";

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
                to={`/teacher/courses/${course.id}`}
                className="border border-gray-200 p-6 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Course</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {course.courseName || 'Course Title'}
                </h3>
                
                <p className="text-blue-600 mb-4 font-medium">
                  {course.courseCode || 'Course Code'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="block">Academic Year</span>
                    <span className="text-gray-900 font-medium">{course.academicYear || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <span className="font-medium">Manage</span>
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">No courses assigned</h3>
                <p className="text-gray-600">You don't have any courses assigned yet. Contact your administrator to get started.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}