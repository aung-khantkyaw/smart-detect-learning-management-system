import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import brain from '../assets/img/brain.png'
import bulb from '../assets/img/bulb.png'
import coffee from '../assets/img/coffee.png'
import cross from '../assets/img/cross.png'
import line from '../assets/img/line.png'
import line2 from '../assets/img/line2.png'

export default function LoginForm({ onSubmit }) {
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
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      
  const data = await res.json();

      if (res.ok && data.status === "success") {
    
      // localStorage.setItem("token", data.data.accessToken);
      localStorage.setItem("role", data.data.role);
     
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("userData", JSON.stringify(data.data));
      
     if(data.data.role === 'ADMIN'){
        window.location.href = "/admin"
     }else{
        window.location.href = "/dashboard";
      }

    } else {
      setErrors(data.message || "Login failed");
    }
  } catch (err) {
    setErrors("Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
 <div className='m-2 h-[96vh] relative bg-[#5C85D9] text-white rounded-lg '>
      {/* // Hero Section Background  */}
            <img src={bulb} className='absolute h-10 top-24 left-8'></img>
            <img src={brain} className='absolute h-10 top-80 right-72'></img>
            <img src={coffee} className='absolute h-10 top-44 right-28'></img>
            <img src={cross} className='absolute h-30 top-64 left-52'></img>
            <img src={line} className='absolute bottom-0 h-42 w-46 left-52'></img>
            <img src={line2} className='absolute right-0 top-[42px] h-[550px] w-120'></img>
          
         

    <div className="flex items-center justify-center p-4 pt-32 text-zinc-100">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="p-6 backdrop-blur-xl rounded-2xl sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to LMS</h1>
            {/* <p className="mt-1 text-sm text-zinc-400">Sign in to your account</p> */}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <label className="block group">
              <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 focus-within:border-zinc-600 px-3 py-2.5 transition-colors">
                <Mail className="size-4 text-zinc-500" aria-hidden />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm bg-transparent outline-none placeholder:text-zinc-500"
                />
              </div>
              {errors.email && (
                <span className="block mt-1 text-xs text-red-400">{errors.email}</span>
              )}
            </label>

            {/* Password */}
            <label className="block group">
              <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 focus-within:border-zinc-600 px-3 py-2.5 transition-colors">
                <Lock className="size-4 text-zinc-500" aria-hidden />
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm bg-transparent outline-none placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="p-1 -mr-1 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="size-4 text-zinc-400" /> : <Eye className="size-4 text-zinc-400" />}
                </button>
              </div>
              {errors.password && (
                <span className="block mt-1 text-xs text-red-400">{errors.password}</span>
              )}
            </label>

            {/* Actions
            <div className="flex items-center justify-between pt-2">
              <label className="inline-flex items-center gap-2 text-xs select-none text-zinc-400">
                <input type="checkbox" className="rounded size-4 border-zinc-700 bg-zinc-900 text-zinc-200 focus:ring-0" />
                Remember me
              </label>
              <a href="#" className="text-xs transition-colors text-zinc-300 hover:text-white">Forgot password?</a>
            </div> */}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center rounded-xl bg-white text-black font-medium py-2.5 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" opacity="0.25" /><path d="M22 12a10 10 0 0 1-10 10" /></svg>
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer */}
          {/* <p className="mt-6 text-xs text-center text-zinc-500">
            Don't have an account?{" "}
            <a href="#" className="text-zinc-300 hover:text-white">Create one</a>
          </p> */}
        </div>
      </div>
    </div>
    </div>

  );
}