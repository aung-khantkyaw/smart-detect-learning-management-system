import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../../lib/api";

export default function Students() {
  const { id } = useParams(); // course offering ID
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [majorsMap, setMajorsMap] = useState({});
  const [studentStats, setStudentStats] = useState({}); // { [studentId]: { totalSubmissions, rejectedAI } }
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetchEnrolledStudents();
  }, [id]);

  const fetchEnrolledStudents = async () => {
    try {
      // Get enrollments for this offering
      const enrollmentsData = await api.get("/enrollments");
      const allEnrollments = Array.isArray(enrollmentsData)
        ? enrollmentsData
        : [];

      // Filter enrollments for this offering
      const offeringEnrollments = allEnrollments.filter(
        (enrollment) => enrollment.offeringId === id
      );

      if (offeringEnrollments.length === 0) {
        setStudents([]);
        return;
      }

      // Get student details
      const allUsers = await api.get("/users");

      // Get majors and build id->name map
      let majorsMapLocal = {};
      try {
        const majorsResp = await api.get('/majors');
        const majorsList = Array.isArray(majorsResp) ? majorsResp : (majorsResp?.data || []);
        for (const m of majorsList) {
          if (m?.id) majorsMapLocal[m.id] = m.name || m.title || m.code || 'Unknown Major';
        }
        setMajorsMap(majorsMapLocal);
      } catch (e) {
        console.warn('Failed to load majors list', e);
        majorsMapLocal = {};
        setMajorsMap({});
      }

      // Match enrollments with student data
      const enrolledStudents = offeringEnrollments.map((enrollment) => {
        const student = allUsers.find(
          (user) => user.id === enrollment.studentId
        );
        return {
          ...enrollment,
          studentName: student?.fullName || "Unknown Student",
          studentEmail: student?.email || "",
          studentNumber: student?.studentNumber || "",
          majorId: student?.majorId,
          academicYearId: student?.academicYearId,
          studentMajor: (student?.majorId && majorsMapLocal[student.majorId]) ? majorsMapLocal[student.majorId] : undefined,
        };
      });

      setStudents(enrolledStudents);

      // Get available students (not enrolled in this course)
      const enrolledStudentIds = enrolledStudents.map((e) => e.studentId);
      const availableStudentsList = allUsers.filter(
        (user) =>
          user.role === "STUDENT" && !enrolledStudentIds.includes(user.id)
      );
      setAvailableStudents(availableStudentsList);

      // Fetch per-student stats (total submissions and REJECTED_AI)
      try {
        setStatsLoading(true);
        const pairs = await Promise.all(
          enrolledStudents.map(async (e) => {
            try {
              // Get total submissions (all assignments)
              const statsRes = await api.get(`/assignments/submissions/student/${e.studentId}/stats`);
              // Get AI flag count for this specific offering
              const aiFlagRes = await api.get(`/assignments/ai-flag/${id}/${e.studentId}/count`);
              return [e.studentId, { 
                totalSubmissions: statsRes?.totalSubmissions || 0, 
                rejectedAI: aiFlagRes?.count || 0 
              }];
            } catch (err) {
              console.warn('Failed to fetch stats for', e.studentId, err);
              return [e.studentId, { totalSubmissions: 0, rejectedAI: 0 }];
            }
          })
        );
        setStudentStats(Object.fromEntries(pairs));
      } finally {
        setStatsLoading(false);
      }
    } catch (err) {
      console.error("Error fetching enrolled students:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudents = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student");
      return;
    }

    try {
      await api.post("/enrollments", {
        studentIds: selectedStudents,
        offeringId: id,
      });

      setShowEnrollModal(false);
      setSelectedStudents([]);
      fetchEnrolledStudents();

      // Success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      notification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Students enrolled successfully!
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (err) {
      console.error("Enrollment error:", err);
      alert("Enrollment failed: " + err.message);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Enrolled Students</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Total: {students.length} students
          </div>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Enroll Students
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Major
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Submissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rejected AI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrolled Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {enrollment.studentNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {enrollment.studentName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {enrollment.studentEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {enrollment.studentMajor}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {statsLoading ? (
                          <span className="inline-flex items-center text-gray-500">
                            <svg className="animate-spin h-4 w-4 mr-2 text-gray-400" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            Loading
                          </span>
                        ) : (
                          studentStats[enrollment.studentId]?.totalSubmissions ?? 0
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {statsLoading ? (
                          <span className="inline-flex items-center text-gray-500">
                            <svg className="animate-spin h-4 w-4 mr-2 text-gray-400" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            Loading
                          </span>
                        ) : (
                          studentStats[enrollment.studentId]?.rejectedAI ?? 0
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No students enrolled
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No students have enrolled in this course yet.
            </p>
          </div>
        )}
      </div>

      {/* Enroll Students Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Enroll Students
                </h3>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Available Students ({availableStudents.length})
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Select students to enroll in this course:
                </p>
              </div>

              {availableStudents.length > 0 ? (
                <div className="space-y-2">
                  {availableStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedStudents.includes(student.id)
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => toggleStudentSelection(student.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                          {student.fullName?.charAt(0) || "S"}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {student.fullName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.email}
                          </div>
                          {student.studentNumber && (
                            <div className="text-xs text-gray-500">
                              ID: {student.studentNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="mx-auto h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                  <p className="mt-2 text-sm">
                    All students are already enrolled
                  </p>
                </div>
              )}
            </div>

            {availableStudents.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {selectedStudents.length} student(s) selected
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowEnrollModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEnrollStudents}
                    disabled={selectedStudents.length === 0}
                    className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enroll Selected
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
