import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import NotificationBell from "../../components/NotificationBell";
import {
  Brain,
  BookOpen,
  User,
  Bell,
  MessageCircle,
  Users,
} from "lucide-react";

export default function StudentDashboard() {
  const [authUser, setAuthUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userData");
      if (raw) setAuthUser(JSON.parse(raw));
    } catch {
      setAuthUser(null);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userData");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
  };

  return (
    <>
      <div>
        <div className="">
          <aside
            id="cta-button-sidebar"
            className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
            aria-label="Sidebar"
          >
            <div className="h-full px-3 py-4 border-r bg-white flex flex-col">
              <ul className="space-y-2 font-medium flex-1 overflow-y-auto pr-1">
                <li className="mb-2">
                  <NavLink
                    to="/dashboard"
                    className="group flex items-center justify-between gap-3 rounded-md px-2.5 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-gray-900">
                          Smart Detect LMS
                        </span>
                        <span className="text-xs text-gray-500">
                          Student Dashboard
                        </span>
                      </div>
                    </div>
                    <svg
                      className="h-4 w-4 text-gray-300 group-hover:text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                      [
                        "relative flex items-center px-3 py-2.5 transition-colors duration-150 rounded-md group",
                        isActive
                          ? "bg-gray-100 text-gray-900 border-l-2 border-blue-500"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      ].join(" ")
                    }
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-500 transition-colors group-hover:bg-gray-200 group-hover:text-gray-700">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="ml-2 text-sm font-medium">My Courses</span>
                    <svg
                      className="ml-auto h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/dashboard/notifications"
                    className={({ isActive }) =>
                      [
                        "relative flex items-center px-3 py-2.5 transition-colors duration-150 rounded-md group",
                        isActive
                          ? "bg-gray-100 text-gray-900 border-l-2 border-blue-500"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      ].join(" ")
                    }
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-500 transition-colors group-hover:bg-gray-200 group-hover:text-gray-700">
                      <Bell className="h-4 w-4" />
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      Notifications
                    </span>
                    <svg
                      className="ml-auto h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/dashboard/profile"
                    className={({ isActive }) =>
                      [
                        "relative flex items-center px-3 py-2.5 transition-colors duration-150 rounded-md group",
                        isActive
                          ? "bg-gray-100 text-gray-900 border-l-2 border-blue-500"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      ].join(" ")
                    }
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-500 transition-colors group-hover:bg-gray-200 group-hover:text-gray-700">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="ml-2 text-sm font-medium">Profile</span>
                    <svg
                      className="ml-auto h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </NavLink>
                </li>

                {/* <li>
                  <NavLink
                    to="/dashboard/chat"
                    className={({ isActive }) =>
                      [
                        "relative flex items-center px-3 py-2.5 transition-colors duration-150 rounded-md group",
                        isActive
                          ? "bg-gray-100 text-gray-900 border-l-2 border-blue-500"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      ].join(" ")
                    }
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-500 transition-colors group-hover:bg-gray-200 group-hover:text-gray-700">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <span className="ml-2 text-sm font-medium">Course Chat</span>
                    <svg
                      className="ml-auto h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </NavLink>
                </li> */}

                <li>
                  <NavLink
                    to="/dashboard/academic-chat"
                    className={({ isActive }) =>
                      [
                        "relative flex items-center px-3 py-2.5 transition-colors duration-150 rounded-md group",
                        isActive
                          ? "bg-gray-100 text-gray-900 border-l-2 border-blue-500"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      ].join(" ")
                    }
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-500 transition-colors group-hover:bg-gray-200 group-hover:text-gray-700">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      Academic Year Chat
                    </span>
                    <svg
                      className="ml-auto h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </NavLink>
                </li>
              </ul>

              {/* Authenticated user panel with dropdown */}
              <div className="mt-3 border-t pt-3 relative" ref={userMenuRef}>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-sm font-semibold ring-1 ring-gray-200 shadow-sm">
                    {(() => {
                      const src = (
                        authUser?.fullName ||
                        authUser?.username ||
                        authUser?.email ||
                        "U"
                      ).toString();
                      const initials = src
                        .split(" ")
                        .filter(Boolean)
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                      return initials || "U";
                    })()}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {authUser?.fullName || authUser?.username || "Student"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {authUser?.email ? authUser.email : ""}
                    </div>
                  </div>
                  <svg
                    className={`ml-auto h-4 w-4 text-gray-300 transition-transform ${
                      userMenuOpen
                        ? "rotate-180 text-gray-400"
                        : "group-hover:text-gray-400"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 bottom-full mb-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 overflow-hidden z-50"
                  >
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                        <path d="M12 9l3 3-3 3m3-3H3" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <div className="p-4 sm:ml-64">
            {/* Top Header with Notification Bell */}
            <div className="flex justify-between items-center mb-6 bg-white rounded-lg shadow-sm border p-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-gray-600">Welcome back, {authUser?.fullName || 'Student'}!</p>
              </div>
              <NotificationBell />
            </div>
            
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
