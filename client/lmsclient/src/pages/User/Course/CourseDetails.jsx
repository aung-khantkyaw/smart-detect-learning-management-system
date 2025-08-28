import React, { useState, useEffect } from 'react'
import CourseNav from './components/courseNav.jsx'
import { Outlet } from "react-router-dom";
import { useParams } from "react-router-dom";
import { api } from "../../../lib/api";

export default function CourseOverview() {
  const { id } = useParams(); // offering ID from URL
  const [course, setCourse] = useState(null);
  const [offering, setOffering] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseByOffering = async () => {
      try {
        // 1) Load offering by offeringId from the route
        const off = await api.get(`/course-offerings/${id}`);
        const offPayload = Array.isArray(off) ? off[0] : off?.data || off;
        if (!offPayload) {
          setOffering(null);
          setCourse(null);
          return;
        }
        setOffering(offPayload);

        // 2) Load parent course using courseId from offering
        const c = await api.get(`/courses/${offPayload.courseId}`);
        const coursePayload = Array.isArray(c) ? c[0] : c?.data || c;
        setCourse(coursePayload || null);
      } catch (err) {
        console.error("Error loading course/offering:", err);
        setOffering(null);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseByOffering();
  }, [id]);
  
  if (loading) {
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
          {course ? (
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{course.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                {course.code && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white/15 border border-white/20 backdrop-blur">
                    Code: <span className="ml-1 font-semibold">{course.code}</span>
                  </span>
                )}
                {course.category && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white/15 border border-white/20 backdrop-blur">
                    Category: <span className="ml-1 font-semibold">{course.category}</span>
                  </span>
                )}
                {offering?.name && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white/15 border border-white/20 backdrop-blur">
                    Offering: <span className="ml-1 font-semibold">{offering.name}</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-white/90">Course not found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs-first: keep the nav immediately after the header */}
      <CourseNav />

      {/* Nested routes */}
      <Outlet context={{ course, offering }} />
    </>
  )
}