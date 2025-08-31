import React, { useEffect } from "react";
import {
  ArrowRight,
  Brain,
  BarChart3,
  MessageSquare,
  TrendingUp,
  BookOpen,
  Users,
  Zap,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("accessToken");
    
    if (role && token) {
      if (role === 'ADMIN') {
        navigate("/admin");
      } else if (role === 'STUDENT') {
        navigate("/dashboard");
      } else if (role === 'TEACHER') {
        navigate("/teacher");
      }
    }
  }, [navigate]);

  const isLoggedIn = localStorage.getItem("accessToken");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-800">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-white" />
            <span className="text-xl font-bold text-white">
              Smart Detect LMS
            </span>
          </div>

          {!isLoggedIn && (
            <NavLink
              to="/login"
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-semibold transition-colors border border-white/30"
            >
              Login
            </NavLink>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Transform Your Learning with{" "}
          <span className="text-yellow-300">Smart Courses</span> and{" "}
          <span className="text-yellow-300">Intelligent Analytics</span>
        </h1>

        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
          Personalized learning paths, real-time collaboration, and
          comprehensive progress tracking. Built for modern learners and
          educators.
        </p>

        {/* Dashboard Mockup */}
        <div className="relative max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Browser Header */}
            <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 text-sm text-gray-600 ml-4">
                  sdlms.edu.mm/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Welcome back, John!
                  </h3>
                  <p className="text-blue-100">
                    Ready to continue your learning journey?
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">JD</span>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-8">
              {/* Navigation Tabs */}
              <div className="flex space-x-8 mb-8 border-b border-gray-200">
                <button className="pb-4 px-2 border-b-2 border-blue-600 text-blue-600 font-semibold">
                  Dashboard
                </button>
                <button className="pb-4 px-2 text-gray-500 hover:text-gray-700">
                  My Courses
                </button>
                <button className="pb-4 px-2 text-gray-500 hover:text-gray-700">
                  Assignments
                </button>
                <button className="pb-4 px-2 text-gray-500 hover:text-gray-700">
                  Grades
                </button>
                <button className="pb-4 px-2 text-gray-500 hover:text-gray-700">
                  Calendar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Quick Stats */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">
                        Enrolled Courses
                      </p>
                      <p className="text-2xl font-bold text-gray-900">6</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">
                        Completed
                      </p>
                      <p className="text-2xl font-bold text-gray-900">4</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">
                        Assignments Due
                      </p>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">
                        Average Grade
                      </p>
                      <p className="text-2xl font-bold text-gray-900">A-</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Courses */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Current Courses
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            Computer Science 101
                          </h4>
                          <p className="text-xs text-gray-500">Prof. Johnson</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        92%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            Data Structures
                          </h4>
                          <p className="text-xs text-gray-500">Prof. Smith</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        78%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Upcoming Assignments */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Upcoming Assignments
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          Final Project
                        </h4>
                        <p className="text-xs text-gray-500">
                          Computer Science 101
                        </p>
                      </div>
                      <span className="text-xs font-medium text-red-600">
                        Due Tomorrow
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          Algorithm Analysis
                        </h4>
                        <p className="text-xs text-gray-500">Data Structures</p>
                      </div>
                      <span className="text-xs font-medium text-yellow-600">
                        Due in 3 days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose Smart LMS?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Powerful features designed for modern education
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border border-white/20">
            <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Collaboration</h3>
            <p className="text-blue-100">
              Connect with peers and instructors seamlessly
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border border-white/20">
            <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              Smart Detection
            </h3>
            <p className="text-blue-100">
              Advanced analytics for personalized insights
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border border-white/20">
            <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              Progress Tracking
            </h3>
            <p className="text-blue-100">
              Real-time monitoring of your learning journey
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-sm border-t border-white/20 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-8 h-8 text-white" />
                <span className="text-xl font-bold text-white">Smart LMS</span>
              </div>
              <p className="text-blue-100 text-sm">
                Transforming education with AI-powered learning management.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Team
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-100 text-sm">
              © 2024 Smart LMS. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-blue-100 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-blue-100 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-blue-100 hover:text-white text-sm transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
