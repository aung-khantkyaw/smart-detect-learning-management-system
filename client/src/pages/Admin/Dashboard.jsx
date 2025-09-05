import React, { useState, useEffect, useRef } from "react";

import { NavLink } from "react-router-dom";

import { Link, Outlet, useLocation } from "react-router-dom";
import { api } from "../../lib/api";
import { Brain } from "lucide-react";
export default function Home() {
  const location = useLocation();

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

  // Close user dropdown on outside click
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
      // no-op: proceed to clear client state regardless of server result
      console.error("Logout error:", e);
    } finally {
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userData");
      localStorage.removeItem("role");
      // Redirect to login page
      window.location.href = "/login";
    }
  };

  return (
    <>
      <div>
        {/* logo navigation container */}

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
                    to="/admin"
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
                          Admin Dashboard
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
                    to="/admin/departments"
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
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      Departments
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
                    to="/admin/positions"
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
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium">Positions</span>
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
                    to="/admin/academic-years"
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
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      Academic Years
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
                    to="/admin/majors"
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
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium">Majors</span>
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
                    to="/admin/users"
                    end
                    className={({ isActive }) =>
                      [
                        "relative flex items-center px-3 py-2.5 transition-colors duration-150 rounded-md group",
                        isActive || location.pathname === "/admin/users"
                          ? "bg-gray-100 text-gray-900 border-l-2 border-blue-500"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      ].join(" ")
                    }
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-500 transition-colors group-hover:bg-gray-200 group-hover:text-gray-700">
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      User Management
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
                    to="/admin/courses"
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
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      Course Management
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
                    to="/admin/course-offerings"
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
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      Course Offerings
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
                    to="/admin/enrollments"
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
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      Enrollments
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
                    to="/admin/announcements"
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
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      Announcements
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
                    to="/admin/chat-rooms"
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
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium">Chat Rooms</span>
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
                    to="/admin/backups-restore"
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
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2a10 10 0 00-10 10c0 4.418 2.686 8.164 6.553 9.688l-1.053-3.157A7.963 7.963 0 013 12a8 8 0 0114.553-4.688l1.053 3.157A9.964 9.964 0 0022 12a10 10 0 00-10-10zm-1 15h2v2h-2v-2zm0-12h2v10h-2V5z" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium">Backups Restore</span>
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
                      {authUser?.fullName || authUser?.username || "Admin"}
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
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
