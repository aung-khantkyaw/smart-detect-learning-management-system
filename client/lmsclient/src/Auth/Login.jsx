import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Brain, Sparkles } from "lucide-react";
import { api } from "../lib/api";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

 const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = await api.post("/auth/login", { email, password });

      localStorage.setItem("role", data.role);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userData", JSON.stringify(data));

      if (data.role === 'ADMIN') {
        window.location.href = "/admin";
      } else if (data.role === 'STUDENT') {
        window.location.href = "/dashboard";
      } else if (data.role === 'TEACHER') {
        window.location.href = "/teacher";
      } else {
        window.location.href = "/";
      }
  } catch (err) {
    setErrors(err?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-800">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">Smart Detect LMS</span>
          </div>
        </div>
      </nav>

      {/* Login Section */}
      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          {/* Welcome Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/20 text-blue-100 px-4 py-2 rounded-full text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              Welcome Back
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Sign In</h1>
            <p className="text-blue-100">Access your learning dashboard</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">Email Address</label>
                <div className="relative">
                  <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 focus-within:border-blue-400 focus-within:bg-white/10 px-4 py-3 transition-all">
                    <Mail className="w-5 h-5 text-blue-200" />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent outline-none text-white placeholder:text-blue-200"
                    />
                  </div>
                  {errors.email && (
                    <span className="block mt-1 text-xs text-red-300">{errors.email}</span>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">Password</label>
                <div className="relative">
                  <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 focus-within:border-blue-400 focus-within:bg-white/10 px-4 py-3 transition-all">
                    <Lock className="w-5 h-5 text-blue-200" />
                    <input
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent outline-none text-white placeholder:text-blue-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="p-1 rounded-md hover:bg-white/10 transition-colors"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="w-5 h-5 text-blue-200" /> : <Eye className="w-5 h-5 text-blue-200" />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="block mt-1 text-xs text-red-300">{errors.password}</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" opacity="0.25" />
                      <path d="M22 12a10 10 0 0 1-10 10" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>

              {/* Error Display */}
              {typeof errors === 'string' && (
                <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl text-sm">
                  {errors}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}