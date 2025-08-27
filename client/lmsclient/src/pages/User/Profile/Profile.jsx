import React from 'react'
import { useState ,useEffect} from "react";

export default function Profile() {
 const [user, setUser] = useState(null);
  const [academicYear, setAcademicYear] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUserData = localStorage.getItem("userData");
    
    if (!token) {
      console.error("No token found - please login again");
      setLoading(false);
      return;
    }

    // If we have stored user data, use it directly
  if (storedUserData) {
  try {
    const parsed = JSON.parse(storedUserData);
    setUser(parsed);

    // 🔹 fetch academic years to resolve the name
    fetch("http://localhost:3000/api/academic-years", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(academicYearsData => {
      if (academicYearsData.status === "success" && parsed.academicYearId) {
        const yearData = academicYearsData.data.find(y => y.id === parsed.academicYearId);
        setAcademicYear(yearData?.name || 'Not assigned');
      }
    });

    setLoading(false);
    return;
  } catch (err) {
    console.error("Error parsing stored user data:", err);
  }
}


    // Fallback: try to get current user from API
    const fetchCurrentUser = async () => {
      try {
        const [userRes, academicYearsRes] = await Promise.all([
          fetch(`http://localhost:3000/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:3000/api/academic-years", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const [userData, academicYearsData] = await Promise.all([
          userRes.json(), academicYearsRes.json()
        ]);

        if (userData.status === "success") {
          setUser(userData.data);
          localStorage.setItem("userData", JSON.stringify(userData.data));
          
          // Find academic year name
          if (academicYearsData.status === "success" && userData.data.academicYearId) {
            const yearData = academicYearsData.data.find(y => y.id === userData.data.academicYearId);
            setAcademicYear(yearData?.name || 'Not assigned');
          }
        } else {
          console.error(userData.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

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

  if (!user) {
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
            <h2 className="text-2xl font-bold text-gray-900">{ user?.fullName}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-gray-200 p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">Personal Information</h3>
              <div className="space-y-4">
                <div className="border-l-3 border-blue-400 pl-3">
                  <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                  <p className="text-gray-900 font-medium">{ user?.fullName}</p>
                </div>
                <div className="border-l-3 border-blue-400 pl-3">
                  <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                  <p className="text-gray-900 font-medium">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">Academic Information</h3>
              <div className="space-y-4">
                <div className="border-l-3 border-purple-400 pl-3">
                  <label className="block text-sm text-gray-600 mb-1">Student Number</label>
                  <p className="text-gray-900 font-medium">{user?.studentNumber || 'Not assigned'}</p>
                </div>
                <div className="border-l-3 border-purple-400 pl-3">
                  <label className="block text-sm text-gray-600 mb-1">Academic Year</label>
                  <p className="text-gray-900 font-medium">{academicYear || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}