import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { BookOpen, User, Bell, LogOut, Brain, MessageCircle, Users } from "lucide-react";

export default function StudentDashboard() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-72 bg-white/80 backdrop-blur-md border-r border-gray-200 shadow-lg">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Smart LMS</h2>
                <p className="text-sm text-gray-600">Student Portal</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) =>
                    `group flex items-center p-3 rounded-xl transition-all ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <div className={`p-2 rounded-lg mr-3 transition-colors ${
                    location.pathname === "/dashboard" 
                      ? "bg-blue-100" 
                      : "bg-gray-100 group-hover:bg-gray-200"
                  }`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Courses</span>
                </NavLink>
              </li>
              
              <li>
                <NavLink
                  to="/dashboard/profile"
                  className={({ isActive }) =>
                    `group flex items-center p-3 rounded-xl transition-all ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <div className={`p-2 rounded-lg mr-3 transition-colors ${
                    location.pathname === "/dashboard/profile" 
                      ? "bg-blue-100" 
                      : "bg-gray-100 group-hover:bg-gray-200"
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Profile</span>
                </NavLink>
              </li>
              
              <li>
                <NavLink
                  to="/dashboard/notifications"
                  className={({ isActive }) =>
                    `group flex items-center p-3 rounded-xl transition-all ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <div className={`p-2 rounded-lg mr-3 transition-colors ${
                    location.pathname === "/dashboard/notifications" 
                      ? "bg-blue-100" 
                      : "bg-gray-100 group-hover:bg-gray-200"
                  }`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Notifications</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/dashboard/chat"
                  className={({ isActive }) =>
                    `group flex items-center p-3 rounded-xl transition-all ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <div className={`p-2 rounded-lg mr-3 transition-colors ${
                    location.pathname === "/dashboard/chat" 
                      ? "bg-blue-100" 
                      : "bg-gray-100 group-hover:bg-gray-200"
                  }`}>
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Course Chat</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/dashboard/academic-chat"
                  className={({ isActive }) =>
                    `group flex items-center p-3 rounded-xl transition-all ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <div className={`p-2 rounded-lg mr-3 transition-colors ${
                    location.pathname === "/dashboard/academic-chat" 
                      ? "bg-blue-100" 
                      : "bg-gray-100 group-hover:bg-gray-200"
                  }`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Academic Year Chat</span>
                </NavLink>
              </li>
            </ul>
            
            {/* Logout Button */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                className="w-full group flex items-center p-3 rounded-xl transition-all text-gray-700 hover:bg-red-50 hover:text-red-600"
              >
                <div className="p-2 rounded-lg mr-3 bg-gray-100 group-hover:bg-red-100 transition-colors">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full bg-white/60 backdrop-blur-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}