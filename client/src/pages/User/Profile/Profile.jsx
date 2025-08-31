import React from 'react'
import { useState ,useEffect} from "react";
import { api } from '../../../lib/api';

export default function Profile() {
 const [user, setUser] = useState(null);
  const [academicYear, setAcademicYear] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");

    // If we have stored user data, use it directly and resolve academic year name
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        setUser(parsed);

        api.get('/academic-years').then((academicYears) => {
          if (parsed.academicYearId) {
            const yearData = academicYears.find(y => y.id === parsed.academicYearId);
            setAcademicYear(yearData?.name || 'Not assigned');
          }
        }).finally(() => setLoading(false));
        return;
      } catch (err) {
        console.error("Error parsing stored user data:", err);
      }
    }

    // Fallback: try to get current user from API
    const fetchCurrentUser = async () => {
      try {
        const [userData, academicYears] = await Promise.all([
          api.get('/users/me'),
          api.get('/academic-years')
        ]);

        const me = userData?.data || userData; // handle both wrapped and raw
        setUser(me);
        localStorage.setItem("userData", JSON.stringify(me));

        if (me?.academicYearId) {
          const yearData = academicYears.find(y => y.id === me.academicYearId);
          setAcademicYear(yearData?.name || 'Not assigned');
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600/30 border-t-blue-600"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-600">Unable to load profile information.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{user?.fullName}</h1>
              <p className="text-blue-100 text-lg">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/30">
                  Student Profile
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border-l-4 border-blue-500">
                <label className="block text-sm font-medium text-blue-700 mb-2">Full Name</label>
                <p className="text-gray-900 font-semibold text-lg">{user?.fullName}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border-l-4 border-blue-500">
                <label className="block text-sm font-medium text-blue-700 mb-2">Email Address</label>
                <p className="text-gray-900 font-semibold text-lg">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Academic Information Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Academic Information</h3>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border-l-4 border-purple-500">
                <label className="block text-sm font-medium text-purple-700 mb-2">Student Number</label>
                <p className="text-gray-900 font-semibold text-lg">{user?.studentNumber || 'Not assigned'}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border-l-4 border-purple-500">
                <label className="block text-sm font-medium text-purple-700 mb-2">Academic Year</label>
                <p className="text-gray-900 font-semibold text-lg">{academicYear || 'Not assigned'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}