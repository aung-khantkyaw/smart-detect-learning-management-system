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
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Unable to load profile information.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👨‍🏫 My Profile</h1>
          <p className="text-gray-600">View your profile information</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold">
                {profile.fullName?.charAt(0) || 'T'}
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                <p className="text-blue-100">{profile.email}</p>
              
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="text-gray-900">{profile.fullName}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{profile.email}</p>
                </div>

             
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                  <p className="text-gray-900">{profile.departmentName}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Position</label>
                  <p className="text-gray-900">{profile.positionName}</p>
                </div>

              

               
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}