import React, { useEffect, useState } from "react";

export default function TeacherProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("accessToken");
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.id;

    if (!userId || !token) {
      setLoading(false);
      return;
    }

    try {
      const [userRes, departmentsRes, positionsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/api/departments", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/api/positions", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const [userdata, departmentsData, positionsData] = await Promise.all([
        userRes.json(), departmentsRes.json(), positionsRes.json()
      ]);

      if (userdata.status === "success") {
        const user = userdata.data;
        const departments = departmentsData.status === "success" ? departmentsData.data : [];
        const positions = positionsData.status === "success" ? positionsData.data : [];

        const department = departments.find(d => d.id === user.departmentId);
        const position = positions.find(p => p.id === user.positionId);

        setProfile({
          ...user,
          departmentName: department?.name || 'Not assigned',
          positionName: position?.name || 'Not assigned'
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600/30 border-t-blue-600"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Unable to load profile information.</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Profile</span>
        </div>

        <div className="space-y-8">
          <div className="border-l-4 border-blue-600 pl-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
            <p className="text-gray-600">{profile.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-gray-200 p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">Personal Information</h3>
              <div className="space-y-4">
                <div className="border-l-3 border-blue-400 pl-3">
                  <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                  <p className="text-gray-900 font-medium">{profile.fullName}</p>
                </div>
                <div className="border-l-3 border-blue-400 pl-3">
                  <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                  <p className="text-gray-900 font-medium">{profile.email}</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">Professional Information</h3>
              <div className="space-y-4">
                <div className="border-l-3 border-purple-400 pl-3">
                  <label className="block text-sm text-gray-600 mb-1">Department</label>
                  <p className="text-gray-900 font-medium">{profile.departmentName}</p>
                </div>
                <div className="border-l-3 border-purple-400 pl-3">
                  <label className="block text-sm text-gray-600 mb-1">Position</label>
                  <p className="text-gray-900 font-medium">{profile.positionName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}