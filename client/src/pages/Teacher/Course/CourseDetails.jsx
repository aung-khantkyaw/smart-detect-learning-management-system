import React, { useState, useEffect } from 'react'
import TeacherCourseNav from './components/TeacherCourseNav.jsx'
import { Outlet, useParams } from "react-router-dom";
import { api } from "../../../lib/api";

export default function TeacherCourseDetails() {
  const { id } = useParams(); // get course offering ID from URL
  const [courseOffering, setCourseOffering] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseOffering = async () => {
      try {
        const [offerings, allCourses, allAcademicYears] = await Promise.all([
          api.get("/course-offerings"),
          api.get("/courses"),
          api.get("/academic-years"),
        ]);

        const offering = Array.isArray(offerings)
          ? offerings.find((o) => o.id === id)
          : null;

        if (offering) {
          const courseInfo = Array.isArray(allCourses)
            ? allCourses.find((c) => c.id === offering.courseId)
            : undefined;
          const academicYear = Array.isArray(allAcademicYears)
            ? allAcademicYears.find((y) => y.id === offering.academicYearId)
            : undefined;

          setCourseOffering({
            ...offering,
            courseTitle: courseInfo?.title || 'Unknown Course',
            courseCode: courseInfo?.code || 'N/A',
            courseDescription: courseInfo?.description || '',
            academicYear: academicYear?.name || 'N/A'
          });
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
    // Polished skeleton to match final layout
    return (
      <>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/20 rounded w-2/3" />
              <div className="flex gap-3">
                <div className="h-6 bg-white/20 rounded w-24" />
                <div className="h-6 bg-white/20 rounded w-32" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 py-3 border-b">
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
            <div className="h-8 w-28 bg-gray-200 animate-pulse rounded" />
            <div className="h-8 w-36 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {courseOffering ? (
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{courseOffering.courseTitle}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white/15 border border-white/20 backdrop-blur">
                  Code: <span className="ml-1 font-semibold">{courseOffering.courseCode}</span>
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white/15 border border-white/20 backdrop-blur">
                  Academic Year: <span className="ml-1 font-semibold">{courseOffering.academicYear}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-white/90">Course offering not found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs-first: keep the nav immediately after the header */}
      <TeacherCourseNav />

      {/* Overview content moved to Overview tab. */}

      {/* Nested routes */}
      <Outlet context={{ courseOffering }} />
    </>
  )
}