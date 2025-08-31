import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState([]);
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollMode, setEnrollMode] = useState("individual"); // "individual" or "bulk"
  const [formData, setFormData] = useState({
    studentId: "",
    offeringId: "",
    academicYearId: "",
    majorId: ""
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [filters, setFilters] = useState({
    academicYearId: "",
    offeringId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollmentsData, offeringsData, studentsData, coursesData, teachersData, yearsData, majorsData] = await Promise.all([
        api.get("/enrollments"),
        api.get("/course-offerings"),
        api.get("/users?role=STUDENT"),
        api.get("/courses"),
        api.get("/users?role=TEACHER"),
        api.get("/academic-years"),
        api.get("/majors")
      ]);

      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData?.data || []);
      setCourseOfferings(Array.isArray(offeringsData) ? offeringsData : offeringsData?.data || []);
      const studentUsers = Array.isArray(studentsData) ? studentsData : studentsData?.data || [];
      setStudents(studentUsers.filter(user => user.role === 'STUDENT'));
      setCourses(Array.isArray(coursesData) ? coursesData : coursesData?.data || []);
      setTeachers(Array.isArray(teachersData) ? teachersData : teachersData?.data || []);
      setAcademicYears(Array.isArray(yearsData) ? yearsData : yearsData?.data || []);
      setMajors(Array.isArray(majorsData) ? majorsData : majorsData?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = students.find(s => s.id === enrollment.studentId);
    const offering = courseOfferings.find(o => o.id === enrollment.offeringId);
    const course = courses.find(c => c.id === offering?.courseId);

    // Text search (student name or course title)
    const matchesSearch = (
      student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filters
    const matchesYear = !filters.academicYearId || offering?.academicYearId === filters.academicYearId;
    const matchesOffering = !filters.offeringId || enrollment.offeringId === filters.offeringId;
    
    return matchesSearch && matchesYear && matchesOffering;
  });

  const handleEnroll = async (e) => {
    e.preventDefault();
    
    try {
      let requestBody;
      
      if (enrollMode === "individual") {
        requestBody = {
          studentIds: [formData.studentId],
          offeringId: formData.offeringId
        };
      } else {
        // Bulk enrollment: filter students by academic year and major
        const filteredStudents = students.filter(student => 
          student.academicYearId === formData.academicYearId &&
          student.majorId === formData.majorId
        );
        
        requestBody = {
          studentIds: filteredStudents.map(s => s.id),
          offeringId: formData.offeringId
        };
      }
      
      await api.post("/enrollments", requestBody);
      setShowEnrollModal(false);
      fetchData();
      setFormData({ studentId: "", offeringId: "", academicYearId: "", majorId: "" });
    } catch (err) {
      console.error(err);
      alert(err.message || "Enrollment failed");
    }
  };

  const handleUnenroll = (enrollment) => {
    setConfirmTarget(enrollment);
    setDeleteError("");
    setShowConfirm(true);
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enrollment Management</h1>
            <p className="text-gray-600">Manage student enrollments in course offerings</p>
          </div>
          <button
            onClick={() => {
              setEnrollMode("individual");
              setFormData({ studentId: "", offeringId: "", academicYearId: "", majorId: "" });
              setShowEnrollModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Enroll Student
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6 space-y-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Enrollments</label>
            <input
              type="text"
              placeholder="Search by student name or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
              <select
                value={filters.academicYearId}
                onChange={(e) => setFilters(f => ({ ...f, academicYearId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Offering</label>
              <select
                value={filters.offeringId}
                onChange={(e) => setFilters(f => ({ ...f, offeringId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                {courseOfferings
                  .filter(o => !filters.academicYearId || o.academicYearId === filters.academicYearId)
                  .map(o => {
                    const course = courses.find(c => c.id === o.courseId);
                    const teacher = teachers.find(t => t.id === o.teacherId);
                    return (
                      <option key={o.id} value={o.id}>
                        {course?.title || 'Course'} — {teacher?.fullName || 'Teacher'}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setFilters({ academicYearId: "", offeringId: "" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Enrollments ({filteredEnrollments.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEnrollments.length > 0 ? (
                  filteredEnrollments.map((enrollment) => {
                    const student = students.find(s => s.id === enrollment.studentId);
                    const offering = courseOfferings.find(o => o.id === enrollment.offeringId);
                    const course = courses.find(c => c.id === offering?.courseId);
                    const teacher = teachers.find(t => t.id === offering?.teacherId);
                    
                    return (
                      <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {student?.fullName?.charAt(0) || 'S'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student?.fullName || 'Unknown Student'}</div>
                              <div className="text-sm text-gray-500">{student?.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{course?.title || 'Unknown Course'}</div>
                          <div className="text-sm text-gray-500">{course?.code || ''}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{teacher?.fullName || 'Unassigned'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleUnenroll(enrollment)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            Unenroll
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirm Unenroll Modal */}
        <ConfirmDeleteModal
          open={showConfirm}
          title="Unenroll Student"
          message={confirmTarget ? `This will unenroll "${students.find(s => s.id === confirmTarget.studentId)?.fullName || 'Unknown Student'}" from "${courses.find(c => c.id === courseOfferings.find(o => o.id === confirmTarget.offeringId)?.courseId)?.title || 'Unknown Course'}".` : ""}
          requiredText={confirmTarget ? `unenroll ${students.find(s => s.id === confirmTarget.studentId)?.fullName || 'student'}` : ""}
          confirmLabel="Unenroll"
          error={deleteError}
          loading={deleting}
          onClose={() => {
            setShowConfirm(false);
            setConfirmTarget(null);
            setDeleting(false);
            setDeleteError("");
          }}
          onConfirm={async () => {
            if (!confirmTarget) return;
            try {
              setDeleting(true);
              setDeleteError("");
              await api.del(`/enrollments/${confirmTarget.id}`);
              setShowConfirm(false);
              setConfirmTarget(null);
              setDeleting(false);
              fetchData();
            } catch (err) {
              console.error(err);
              setDeleteError(err.message || "Unenrollment failed");
              setDeleting(false);
            }
          }}
        />

        {/* Enroll Modal */}
        {showEnrollModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white relative">
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    👥
                  </div>
                  <h3 className="text-2xl font-bold">Enroll Students</h3>
                  <p className="text-white/80 text-sm mt-1">Add students to course offerings</p>
                </div>
              </div>
              
              <form onSubmit={handleEnroll} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Enrollment Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      enrollMode === "individual" 
                        ? "border-blue-500 bg-blue-50 text-blue-700" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <input
                        type="radio"
                        value="individual"
                        checked={enrollMode === "individual"}
                        onChange={(e) => setEnrollMode(e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-center w-full">
                        <div className="text-2xl mb-1">👤</div>
                        <div className="font-medium text-sm">Individual</div>
                      </div>
                    </label>
                    <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      enrollMode === "bulk" 
                        ? "border-blue-500 bg-blue-50 text-blue-700" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <input
                        type="radio"
                        value="bulk"
                        checked={enrollMode === "bulk"}
                        onChange={(e) => setEnrollMode(e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-center w-full">
                        <div className="text-2xl mb-1">👥</div>
                        <div className="font-medium text-sm">Bulk Enroll</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  {enrollMode === "individual" ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">👤 Select Student</label>
                      <select
                        required
                        value={formData.studentId}
                        onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                      >
                        <option value="">Choose a student...</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>{student.fullName} ({student.email})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">📅 Academic Year</label>
                        <select
                          required
                          value={formData.academicYearId}
                          onChange={(e) => setFormData({...formData, academicYearId: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                        >
                          <option value="">Select academic year...</option>
                          {academicYears.map(year => (
                            <option key={year.id} value={year.id}>{year.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">🎓 Major</label>
                        <select
                          required
                          value={formData.majorId}
                          onChange={(e) => setFormData({...formData, majorId: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                        >
                          <option value="">Select major...</option>
                          {majors.map(major => (
                            <option key={major.id} value={major.id}>{major.name}</option>
                          ))}
                        </select>
                      </div>
                      {formData.academicYearId && formData.majorId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-700">
                            📊 {students.filter(s => s.academicYearId === formData.academicYearId && s.majorId === formData.majorId).length} students will be enrolled
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">📚 Course Offering</label>
                  <select
                    required
                    value={formData.offeringId}
                    onChange={(e) => setFormData({...formData, offeringId: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  >
                    <option value="">Choose course offering...</option>
                    {courseOfferings.map(offering => {
                      const course = courses.find(c => c.id === offering.courseId);
                      const teacher = teachers.find(t => t.id === offering.teacherId);
                      return (
                        <option key={offering.id} value={offering.id}>
                          {course?.title} - {teacher?.fullName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowEnrollModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    {enrollMode === "individual" ? "Enroll Student" : "Enroll All"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}