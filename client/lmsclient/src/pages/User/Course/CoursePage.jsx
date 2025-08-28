import React, { useEffect, useMemo, useState } from 'react';
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { api } from "../../../lib/api";

export default function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) =>
      !q || String(c.title || "").toLowerCase().includes(q) || String(c.code || "").toLowerCase().includes(q)
    );
  }, [courses, query]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Get authenticated user id from localStorage
      const raw = localStorage.getItem("userData");
      const user = raw ? JSON.parse(raw) : null;
      const studentId = user?.id;

      if (!studentId) {
        throw new Error("Missing authenticated user");
      }

      const rows = await api.get(`/students/${studentId}/enrollments`);
      const list = Array.isArray(rows)
        ? rows.map((r) => ({ id: r.courseId, code: r.code, title: r.title, offeringId: r.offeringId }))
        : [];
      setCourses(list);
    } catch (err) {
      console.error("Error loading courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">My Courses</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="animate-pulse">
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-10 w-10 rounded-xl bg-gray-200" />
                    <div className="h-6 w-20 rounded-full bg-gray-200" />
                  </div>
                  <div className="h-5 w-2/3 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-1/3 bg-gray-200 rounded" />
                  <div className="mt-5 flex items-center justify-between">
                    <div className="h-7 w-32 bg-gray-200 rounded" />
                    <div className="h-5 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">My Courses</span>
              <span className="text-xs text-gray-500">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
            </div>
            <div className="flex w-full md:w-auto items-center gap-3">
              <div className="relative w-full md:w-72">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Search by name or code"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((course) => (
              <Link
                key={course.id}
                to={`courses/${course.offeringId || course.id}`}
                className="group block rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <div className="h-16 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30 backdrop-blur">
                    Course
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between -mt-10 mb-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-blue-700">{course.code || "Course Code"}</span>
                  </div>

                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight">
                    {course.title || "Course Title"}
                  </h3>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-blue-600">
                      <span className="font-medium">View</span>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">No courses available</h3>
                <p className="text-gray-600">There are no courses available at the moment.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}