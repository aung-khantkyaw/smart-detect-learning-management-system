import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { api } from "../../../../lib/api";

export default function Overview() {
  const { id } = useParams(); // course id from route
  const { course } = useOutletContext() || {};
  const [loading, setLoading] = useState(!course);
  const [offeringInfo, setOfferingInfo] = useState(null);
  const [teacherName, setTeacherName] = useState("");
  const [teacherPosition, setTeacherPosition] = useState("");
  const [academicYearName, setAcademicYearName] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  // derive department from course if present
  const derivedDepartment = useMemo(() => {
    return (
      course?.department?.name ||
      course?.departmentName ||
      course?.deptName ||
      ""
    );
  }, [course]);

  useEffect(() => {
    // If department name is embedded in course, use it
    if (derivedDepartment) setDepartmentName(derivedDepartment);
  }, [derivedDepartment]);

  useEffect(() => {
    // Resolve user's enrolled offering for this course, then map teacher and academic year
    const loadRelations = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("userData") || "{}");

        // parallel fetches
        const [enrollments, offerings, years] = await Promise.all([
          api.get("/enrollments"),
          api.get("/course-offerings"),
          api.get("/academic-years").catch(() => []),
        ]);

        // find offering for this course where user is enrolled
        const myEnrollment = Array.isArray(enrollments)
          ? enrollments.find(
              (e) =>
                e.studentId === user?.id &&
                (e.offering?.courseId === id || e.offeringId === id)
            )
          : null;

        let resolvedOffering = null;
        if (myEnrollment?.offering) {
          resolvedOffering = myEnrollment.offering;
        } else if (Array.isArray(offerings)) {
          // prefer offering whose courseId matches this course id and matches myEnrollment.offeringId if present
          resolvedOffering =
            offerings.find((o) => o.id === myEnrollment?.offeringId) ||
            offerings.find((o) => o.courseId === id) ||
            null;
        }

        if (resolvedOffering) {
          setOfferingInfo(resolvedOffering);

          // academic year (normalize response shape)
          const yearList = Array.isArray(years) ? years : (years?.data || []);
          const year = Array.isArray(yearList)
            ? yearList.find((y) => y.id === resolvedOffering.academicYearId)
            : null;
          if (year?.name) setAcademicYearName(year.name);

          // teacher details via /users/:id and position via /positions/:id
          if (resolvedOffering.teacherId) {
            try {
              const userRes = await api.get(`/users/${resolvedOffering.teacherId}`);
              const teacher = userRes?.data || userRes;
              const tName = teacher?.fullName || teacher?.name || "";
              if (tName) setTeacherName(tName);

              if (teacher?.positionId) {
                try {
                  const posRes = await api.get(`/positions/${teacher.positionId}`);
                  const pos = posRes?.data || posRes;
                  if (pos?.name) setTeacherPosition(pos.name);
                } catch {}
              }
            } catch {}
          }
        }
        // if department not resolved yet, try map via separate departments endpoint
        if (!derivedDepartment && course?.departmentId) {
          try {
            const deps = await api.get("/departments");
            const dep = Array.isArray(deps)
              ? deps.find((d) => d.id === course.departmentId)
              : null;
            if (dep?.name) setDepartmentName(dep.name);
          } catch {}
        }
      } catch (e) {
        console.error("Overview relation load error:", e);
      } finally {
        setLoading(false);
      }
    };

    // Only run if we have course id
    if (id) loadRelations();
    else setLoading(false);
  }, [id, course]);

  if (loading && !course) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            {/* Title and description */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {course?.title || "N/A"}
              </h3>
              {course?.description && (
                <p className="mt-2 text-gray-700">{course.description}</p>
              )}
            </div>

            {/* Key facts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-medium text-gray-900">Course Code</h4>
                <p className="text-gray-600">{course?.code || "N/A"}</p>
              </div>

              <div className="border-l-4 border-indigo-600 pl-4">
                <h4 className="font-medium text-gray-900">Department</h4>
                <p className="text-gray-600">{departmentName || "N/A"}</p>
              </div>

              <div className="border-l-4 border-purple-600 pl-4">
                <h4 className="font-medium text-gray-900">Academic Year</h4>
                <p className="text-gray-600">{academicYearName || "N/A"}</p>
              </div>

              <div className="border-l-4 border-teal-600 pl-4">
                <h4 className="font-medium text-gray-900">Teacher</h4>
                <p className="text-gray-600">{teacherName || "N/A"}</p>
              </div>

              <div className="border-l-4 border-amber-600 pl-4">
                <h4 className="font-medium text-gray-900">Teacher Position</h4>
                <p className="text-gray-600">{teacherPosition || "N/A"}</p>
              </div>
            </div>

            {/* Offering quick info chips if available */}
            {offeringInfo && (
              <div className="flex flex-wrap gap-2 pt-2">
                {offeringInfo.section && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    Section:{" "}
                    <span className="ml-1 font-semibold">
                      {offeringInfo.section}
                    </span>
                  </span>
                )}
                {offeringInfo.semester && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    Semester:{" "}
                    <span className="ml-1 font-semibold">
                      {offeringInfo.semester}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
