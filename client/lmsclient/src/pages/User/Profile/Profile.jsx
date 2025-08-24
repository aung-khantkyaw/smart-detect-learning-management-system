import React from 'react'
import { useState } from "react";

export default function Profile() {
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    studentId: "STU123456",
    academicYear: "2025 - 2026",
    enrolledCourses: [
      { id: 1, title: "Introduction to Databases", progress: "75%" },
      { id: 2, title: "Web Development with React", progress: "40%" },
      { id: 3, title: "AI & Machine Learning Basics", progress: "90%" },
    ],
    notifications: [
      { id: 1, text: "Assignment 2 for Web Development is due next week." },
      { id: 2, text: "New announcement in AI & Machine Learning." },
    ],
  };

  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle profile edit form
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    alert("Profile updated successfully!");
    // API call to update user profile here
  };

  // Handle password change form
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password changed successfully!");
    // API call to update password here
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Profile Card */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-6">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPpAh63HncAuJOC6TxWkGLYpS0WwNXswz9MA&s"
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-indigo-500"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">
              Student ID: {user.studentId}
            </p>
            <p className="text-sm text-gray-500">
              Academic Year: {user.academicYear}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex space-x-6 border-b">
          {[
            "overview",
            "materials",
            "announcements",
            "notifications",
            "edit profile",
            "change password",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 capitalize ${
                activeTab === tab
                  ? "border-b-2 border-indigo-500 font-semibold text-indigo-600"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-bold mb-4">My Courses (Enrolled)</h2>
              <ul className="space-y-3">
                {user.enrolledCourses.map((course) => (
                  <li
                    key={course.id}
                    className="p-4 bg-gray-50 rounded-lg shadow-sm flex justify-between"
                  >
                    <span>{course.title}</span>
                    <span className="text-indigo-600">{course.progress}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "materials" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Materials</h2>
              <p>📂 Downloadable files will appear here.</p>
            </div>
          )}

          {activeTab === "announcements" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Announcements</h2>
              <p>📢 Latest announcements will be listed here.</p>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Notifications</h2>
              <ul className="space-y-2">
                {user.notifications.map((n) => (
                  <li
                    key={n.id}
                    className="p-3 bg-indigo-50 rounded-lg text-gray-700"
                  >
                    {n.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Edit Profile */}
          {activeTab === "edit profile" && (
            <form
              onSubmit={handleProfileSubmit}
              className="space-y-4 max-w-md mx-auto"
            >
              <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleProfileChange}
                className="w-full border p-2 rounded-lg"
                placeholder="Full Name"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleProfileChange}
                className="w-full border p-2 rounded-lg"
                placeholder="Email"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </form>
          )}

          {/* Change Password */}
          {activeTab === "change password" && (
            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-4 max-w-md mx-auto"
            >
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
              <input
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                className="w-full border p-2 rounded-lg"
                placeholder="Current Password"
              />
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full border p-2 rounded-lg"
                placeholder="New Password"
              />
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full border p-2 rounded-lg"
                placeholder="Confirm New Password"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
