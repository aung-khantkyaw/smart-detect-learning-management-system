import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, GraduationCap } from "lucide-react";
import { api } from "../../lib/api";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState([]);
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      const matchesQuery =
        !q ||
        String(c.courseName || "")
          .toLowerCase()
          .includes(q) ||
        String(c.courseCode || "")
          .toLowerCase()
          .includes(q);
      const matchesYear =
        !yearFilter || String(c.academicYearId) === String(yearFilter);
      return matchesQuery && matchesYear;
    });
  }, [courses, query, yearFilter]);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    let userId = null;
    try {
      const raw = localStorage.getItem("userData");
      const parsed = raw ? JSON.parse(raw) : null;
      userId = parsed?.id || parsed?._id || parsed?.userId || null;
    } catch {
      userId = null;
    }

    if (!userId) {
      console.error("No user ID or token found");
      setLoading(false);
      return;
    }

    try {
      // Try teacher-specific endpoint first
      let offeringsData;
      try {
        const teacherOfferings = await api.get(
          `/teachers/${userId}/course-offerings`
        );
        offeringsData = {
          status: "success",
          data: Array.isArray(teacherOfferings)
            ? teacherOfferings
            : teacherOfferings?.data || [],
        };
      } catch (teacherErr) {
        // Fallback: get all offerings and filter by teacherId
        console.log(teacherErr);
        const allOfferings = await api.get("/course-offerings");
        const list = Array.isArray(allOfferings)
          ? allOfferings
          : allOfferings?.data || [];
        const filtered = list.filter(
          (offering) => String(offering.teacherId) === String(userId)
        );
        offeringsData = { status: "success", data: filtered };
      }

      // Get additional data
      const [coursesData, academicYearsData] = await Promise.all([
        api.get("/courses"),
        api.get("/academic-years"),
      ]);

      if (
        offeringsData.status === "success" &&
        Array.isArray(offeringsData.data)
      ) {
        const offerings = offeringsData.data;
        const allCourses = Array.isArray(coursesData)
          ? coursesData
          : coursesData?.data || [];
        const allAcademicYears = Array.isArray(academicYearsData)
          ? academicYearsData
          : academicYearsData?.data || [];

        // Enrich offerings with course and academic year data
        const enrichedCourses = offerings.map((offering) => {
          const course = allCourses.find((c) => c.id === offering.courseId);
          const academicYear = allAcademicYears.find(
            (y) => y.id === offering.academicYearId
          );
          // Derive enrollment count from various possible API shapes
          const countCandidates = [
            offering.enrolledCount,
            offering.studentCount,
            offering.studentsCount,
            offering.enrollmentsCount,
            Array.isArray(offering.students)
              ? offering.students.length
              : undefined,
            Array.isArray(offering.enrollments)
              ? offering.enrollments.length
              : undefined,
          ].filter((v) => v !== undefined && v !== null);
          const derivedCount = countCandidates.length
            ? Number(countCandidates[0])
            : 0;

          return {
            ...offering,
            courseName: course?.title || "Unknown Course",
            courseCode: course?.code || "N/A",
            academicYear: academicYear?.name || "N/A",
            academicYearId: offering.academicYearId,
            // Optional fields if your API provides them
            section: offering.section || offering.sectionName,
            semester: offering.semester || offering.term,
            enrolledCount: Number.isFinite(derivedCount) ? derivedCount : 0,
          };
        });

        setCourses(enrichedCourses);
        setAcademicYears(allAcademicYears);
      } else {
        setCourses([]);
        setAcademicYears([]);
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
      <div className="p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              My Courses
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
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
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                My Courses
              </span>
              <span className="text-xs text-gray-500">
                {filteredCourses.length} result
                {filteredCourses.length === 1 ? "" : "s"}
              </span>
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
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">All Years</option>
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Link
                key={course.id}
                to={`/teacher/courses/${course.id}`}
                className="group block rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {/* Banner */}
                <div className="h-16 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                  <div className="absolute left-4 top-1/2 right-24 -translate-y-1/2">
                    <span className="block text-white/95 font-semibold text-sm truncate">
                      {course.academicYear || "N/A"}
                    </span>
                  </div>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30 backdrop-blur">
                    Course
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between -mt-10 mb-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-blue-700">
                      {course.courseCode || "Course Code"}
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight">
                    {course.courseName || "Course Title"}
                  </h3>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-700">
                        Enrolled:{" "}
                        <span className="ml-1 font-medium text-gray-900">
                          {Number(course.enrolledCount) || 0}
                        </span>
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 text-blue-600">
                      <span className="font-medium">Manage</span>
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No courses assigned
                </h3>
                <p className="text-gray-600">
                  You don't have any courses assigned yet. Contact your
                  administrator to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
