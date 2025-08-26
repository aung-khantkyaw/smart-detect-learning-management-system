import React, { useEffect, useState } from "react";

import { api } from "../../../lib/api";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "STUDENT",
    department_id: "",
    position_id: "",
    major_id: "",
    academic_year_id: "",
    studentNumber: "",
  });
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [majors, setMajors] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const [emailUsername, setEmailUsername] = useState("");

  function getEmailUsername(email) {
    if (!email) return "";
    const lower = String(email).toLowerCase();
    const domain = "@sdlms.edu.mm";
    if (lower.endsWith(domain)) {
      return email.slice(0, -domain.length);
    }
    return String(email).split("@")[0] || "";
  }

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      if (editingUser) {
        setEmailUsername(getEmailUsername(editingUser.email));
      } else {
        setEmailUsername("");
      }
    }
  }, [showCreateModal, editingUser]);

  async function refreshData() {
    // Fetch users and dropdown data
    try {
      const [userData, deptData, posData, majorData, yearData] =
        await Promise.all([
          api.get("/users"),
          api.get("/departments"),
          api.get("/positions"),
          api.get("/majors"),
          api.get("/academic-years"),
        ]);

      if (Array.isArray(userData)) {
        setUsers(userData);
      } else if (Array.isArray(userData?.data)) {
        setUsers(userData.data);
      } else {
        setUsers([]);
      }

      setDepartments(
        Array.isArray(deptData) ? deptData : deptData?.data || deptData || []
      );
      setPositions(
        Array.isArray(posData) ? posData : posData?.data || posData || []
      );
      setMajors(
        Array.isArray(majorData)
          ? majorData
          : majorData?.data || majorData || []
      );
      setAcademicYears(
        Array.isArray(yearData) ? yearData : yearData?.data || yearData || []
      );
    } catch (err) {
      console.error("Error fetching data:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === "All" || u.role === filterRole;
    const matchesSearch =
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role) => {
    const colors = {
      ADMIN: "bg-red-100 text-red-800",
      TEACHER: "bg-blue-100 text-blue-800",
      STUDENT: "bg-green-100 text-green-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              User Management
            </h1>
            <p className="text-gray-600">Manage and monitor all system users</p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({
                fullName: "",
                email: "",
                password: "",
                role: "STUDENT",
                department_id: "",
                position_id: "",
                major_id: "",
                academic_year_id: "",
                studentNumber: "",
              });
              setEmailUsername("");
              setShowCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            Create User
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Roles</option>

                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {u.fullName?.charAt(0) || "U"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {u.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
                            u.role
                          )}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            u.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={actionMenuOpenId === u.id}
                            onClick={() =>
                              setActionMenuOpenId((prev) =>
                                prev === u.id ? null : u.id
                              )
                            }
                            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Actions"
                          >
                            <svg
                              className="w-5 h-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>

                          {actionMenuOpenId === u.id && (
                            <div
                              role="menu"
                              className="absolute right-0 z-20 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                            >
                              <div className="py-1">
                                <button
                                  role="menuitem"
                                  onClick={() => {
                                    setViewingUser(u);
                                    setActionMenuOpenId(null);
                                  }}
                                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                  View
                                </button>
                                <button
                                  role="menuitem"
                                  onClick={() => {
                                    setEditingUser(u);
                                    setFormData({
                                      fullName: u.fullName || "",
                                      email: u.email || "",
                                      password: "",
                                      role: u.role || "STUDENT",
                                      department_id: u.department_id || "",
                                      position_id: u.position_id || "",
                                      major_id: u.major_id || "",
                                      academic_year_id: u.academic_year_id || "",
                                      studentNumber: u.studentNumber || "",
                                    });
                                    setShowCreateModal(true);
                                    setActionMenuOpenId(null);
                                  }}
                                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                                  Edit
                                </button>
                                <button
                                  role="menuitem"
                                  onClick={() => {
                                    handleToggleActive(u);
                                    setActionMenuOpenId(null);
                                  }}
                                  className={`flex items-center w-full text-left px-3 py-2 text-sm ${u.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                  {u.isActive ? "Ban" : "Unban"}
                                </button>
                                <button
                                  role="menuitem"
                                  onClick={() => {
                                    setConfirmTarget(u);
                                    setDeleteError("");
                                    setShowConfirm(true);
                                    setActionMenuOpenId(null);
                                  }}
                                  className="flex items-center w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
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
                          No users found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Try adjusting your search or filter criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Modal */}
        {viewingUser && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white relative">
                <button
                  onClick={() => setViewingUser(null)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
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
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    {viewingUser.fullName?.charAt(0) || "U"}
                  </div>
                  <h3 className="text-xl font-semibold">
                    {viewingUser.fullName}
                  </h3>
                  <p className="text-white/80 text-sm">{viewingUser.email}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-center gap-4 mb-6">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleBadge(
                      viewingUser.role
                    )}`}
                  >
                    {viewingUser.role}
                  </span>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      viewingUser.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {viewingUser.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Role-specific Information */}
                {viewingUser.role === "TEACHER" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Department</span>
                      <span className="font-medium text-gray-900">
                        {departments.find(
                          (d) =>
                            String(d.id) === String(viewingUser.departmentId)
                        )?.name || "Not assigned"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Position</span>
                      <span className="font-medium text-gray-900">
                        {positions.find(
                          (p) => String(p.id) === String(viewingUser.positionId)
                        )?.name || "Not assigned"}
                      </span>
                    </div>
                  </div>
                )}
                {viewingUser.role === "STUDENT" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Student Number</span>
                      <span className="font-medium text-gray-900">
                        {viewingUser.studentNumber || "Not assigned"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Major</span>
                      <span className="font-medium text-gray-900">
                        {majors.find(
                          (m) => String(m.id) === String(viewingUser.majorId)
                        )?.name || "Not assigned"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Academic Year</span>
                      <span className="font-medium text-gray-900">
                        {academicYears.find(
                          (y) =>
                            String(y.id) === String(viewingUser.academicYearId)
                        )?.name || "Not assigned"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Member since</span>
                    <span>
                      {new Date(viewingUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingUser ? "Edit User" : "Create New User"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="flex items-stretch">
                          <input
                            type="text"
                            required
                            value={emailUsername}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\s+/g, "");
                              setEmailUsername(v);
                              setFormData({
                                ...formData,
                                email: v ? `${v}@sdlms.edu.mm` : "",
                              });
                            }}
                            pattern="^[A-Za-z0-9._-]+$"
                            title="Allowed: letters, numbers, dot, underscore, hyphen"
                            className="max-w-[170px] px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="username"
                          />
                          <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-lg text-sm whitespace-nowrap">
                            @sdlms.edu.mm
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Only the username part is needed. The domain is fixed
                          to @sdlms.edu.mm
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          required={!editingUser}
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder={
                            editingUser
                              ? "Leave blank to keep current"
                              : "Enter password"
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                        >
                          <option value="STUDENT">Student</option>
                          <option value="TEACHER">Teacher</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Role-specific Information */}
                  {formData.role === "TEACHER" && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        Teacher Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Department
                          </label>
                          <select
                            value={formData.department_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                department_id: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Position
                          </label>
                          <select
                            value={formData.position_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                position_id: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                          >
                            <option value="">Select Position</option>
                            {positions.map((pos) => (
                              <option key={pos.id} value={pos.id}>
                                {pos.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.role === "STUDENT" && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-purple-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 14l9-5-9-5-9 5 9 5z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                          />
                        </svg>
                        Student Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Student Number
                          </label>
                          <div className="flex items-stretch">
                            <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-700 rounded-l-lg text-sm whitespace-nowrap">
                              sdlms-
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="^[0-9]+$"
                              title="Digits only"
                              value={(formData.studentNumber || "").replace(/^sdlms-/, "")}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "");
                                setFormData({
                                  ...formData,
                                  studentNumber: digits ? `sdlms-${digits}` : "",
                                });
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="e.g., 2024001"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Major
                          </label>
                          <select
                            value={formData.major_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                major_id: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                          >
                            <option value="">Select Major</option>
                            {majors.map((major) => (
                              <option key={major.id} value={major.id}>
                                {major.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Academic Year
                          </label>
                          <select
                            value={formData.academic_year_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                academic_year_id: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                          >
                            <option value="">Select Academic Year</option>
                            {academicYears.map((year) => (
                              <option key={year.id} value={year.id}>
                                {year.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 mt-6 -mx-6 -mb-6 rounded-b-xl">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                    >
                      {editingUser ? "✓ Update User" : "+ Create User"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={showConfirm}
        title="Delete User"
        message={
          confirmTarget
            ? `This will permanently delete user "${
                confirmTarget.fullName || confirmTarget.email
              }".`
            : ""
        }
        requiredText={confirmTarget ? `delete ${confirmTarget.email}` : ""}
        confirmLabel="Delete"
        error={deleteError}
        loading={deleting}
        onClose={() => setShowConfirm(false)}
        onConfirm={async () => {
          if (!confirmTarget) return;
          try {
            setDeleting(true);
            setDeleteError("");
            await api.del("/auth/delete", { userId: confirmTarget.id });
            setShowConfirm(false);
            setConfirmTarget(null);
            await refreshData();
          } catch (err) {
            setDeleteError(err.message || "Failed to delete user");
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // Compose email from username input and validate domain
      const username = (emailUsername || "").trim();
      const domain = "@sdlms.edu.mm";
      const composedEmail = username
        ? `${username}${domain}`
        : formData.email || "";
      const emailRegex = /^[A-Za-z0-9._-]+@sdlms\.edu\.mm$/;
      if (!emailRegex.test(composedEmail)) {
        alert(
          "Please enter a valid username. The email will be username@sdlms.edu.mm"
        );
        return;
      }

      // Prepare body with role-specific fields
      let body = {
        fullName: formData.fullName,
        email: composedEmail,
        role: formData.role,
      };

      // Add password if provided or creating new user
      if (!editingUser || formData.password) {
        body.password = formData.password;
      }

      // Add role-specific fields
      if (formData.role === "TEACHER") {
        if (formData.department_id) body.department_id = formData.department_id;
        if (formData.position_id) body.position_id = formData.position_id;
      } else if (formData.role === "STUDENT") {
        if (formData.major_id) body.major_id = formData.major_id;
        if (formData.academic_year_id)
          body.academic_year_id = formData.academic_year_id;
        if (formData.studentNumber) body.studentNumber = formData.studentNumber;
      }

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, body);
      } else {
        await api.post("/auth/register", body);
      }

      setShowCreateModal(false);
      // Refresh lists
      Promise.all([
        api.get("/users"),
        api.get("/departments"),
        api.get("/positions"),
        api.get("/majors"),
        api.get("/academic-years"),
      ]).then(([userData, deptData, posData, majorData, yearData]) => {
        if (Array.isArray(userData)) {
          setUsers(userData);
        } else if (Array.isArray(userData?.data)) {
          setUsers(userData.data);
        }
        setDepartments(
          Array.isArray(deptData) ? deptData : deptData?.data || deptData || []
        );
        setPositions(
          Array.isArray(posData) ? posData : posData?.data || posData || []
        );
        setMajors(
          Array.isArray(majorData)
            ? majorData
            : majorData?.data || majorData || []
        );
        setAcademicYears(
          Array.isArray(yearData) ? yearData : yearData?.data || yearData || []
        );
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Operation failed");
    }
  }

  async function handleToggleActive(user) {
    try {
      await api.patch(`/users/${user.id}/activate`);
      await refreshData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update status");
    }
  }
}
