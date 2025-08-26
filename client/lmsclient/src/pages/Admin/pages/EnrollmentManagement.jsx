import React, { useEffect, useState } from "react";

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState([]);
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    offeringId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const [enrollmentsRes, offeringsRes, studentsRes, coursesRes, teachersRes] = await Promise.all([
        fetch("http://localhost:3000/api/enrollments", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:3000/api/course-offerings", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:3000/api/users?role=STUDENT", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:3000/api/courses", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:3000/api/users?role=TEACHER", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const [enrollmentsData, offeringsData, studentsData, coursesData, teachersData] = await Promise.all([
        enrollmentsRes.json(), offeringsRes.json(), studentsRes.json(), coursesRes.json(), teachersRes.json()
      ]);

      setEnrollments(enrollmentsData.status === "success" ? enrollmentsData.data : []);
      setCourseOfferings(offeringsData.status === "success" ? offeringsData.data : []);
      const allUsers = Array.isArray(studentsData) ? studentsData : studentsData.data || [];
      setStudents(allUsers.filter(user => user.role === 'STUDENT'));
      setCourses(coursesData.status === "success" ? coursesData.data : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : teachersData.data || []);
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
    
    return student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           course?.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleEnroll = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    
    try {
      const requestBody = {
        studentIds: [formData.studentId],
        offeringId: formData.offeringId
      };
      
      const res = await fetch("http://localhost:3000/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (res.ok) {
        setShowEnrollModal(false);
        fetchData();
        setFormData({ studentId: "", offeringId: "" });
      } else {
        const error = await res.json();
        alert(error.message || "Enrollment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Enrollment failed");
    }
  };

  const handleUnenroll = async (enrollmentId) => {
    if (!confirm("Are you sure you want to unenroll this student?")) return;
    
    const token = localStorage.getItem("accessToken");
    
    try {
      const res = await fetch(`http://localhost:3000/api/enrollments/${enrollmentId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || "Unenrollment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Unenrollment failed");
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Enrollment Management</h1>
            <p className="text-gray-600">Manage student enrollments in course offerings</p>
          </div>
          <button
            onClick={() => {
              setFormData({ studentId: "", offeringId: "" });
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
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
                            onClick={() => handleUnenroll(enrollment.id)}
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

        {/* Enroll Modal */}
        {showEnrollModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Enroll Student</h3>
                  <button
                    onClick={() => setShowEnrollModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleEnroll} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.fullName} ({student.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Offering</label>
                  <select
                    required
                    value={formData.offeringId}
                    onChange={(e) => setFormData({...formData, offeringId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select Course Offering</option>
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
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEnrollModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Enroll
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