import React from "react";
import { BookOpen, Users, Award, TrendingUp, ArrowRight, Sparkles, Brain, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">Smart LMS</span>
          </div>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm mb-8">
          <Sparkles className="w-4 h-4" />
          AI-Powered Learning Platform
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Learn <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Smarter</span>
          <br />Not Harder
        </h1>
        
        <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Experience the future of education with our intelligent learning management system. 
          Personalized courses, real-time analytics, and seamless collaboration.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
            Start Learning <ArrowRight className="w-5 h-5" />
          </button>
          <button className="border border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-gray-400 text-lg">Everything you need for modern education</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 p-8 rounded-2xl hover:scale-105 transition-all">
            <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Smart Courses</h3>
            <p className="text-gray-400">AI-curated content that adapts to your learning style</p>
          </div>
          
          <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 p-8 rounded-2xl hover:scale-105 transition-all">
            <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Collaboration</h3>
            <p className="text-gray-400">Connect with peers and instructors seamlessly</p>
          </div>
          
          <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 p-8 rounded-2xl hover:scale-105 transition-all">
            <div className="bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Smart Detection</h3>
            <p className="text-gray-400">Advanced analytics for personalized insights</p>
          </div>
          
          <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 p-8 rounded-2xl hover:scale-105 transition-all">
            <div className="bg-orange-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Progress Tracking</h3>
            <p className="text-gray-400">Real-time monitoring of your learning journey</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/20 rounded-3xl p-12">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-gray-300 text-lg mb-8">Join thousands of students already learning smarter</p>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all">
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
}