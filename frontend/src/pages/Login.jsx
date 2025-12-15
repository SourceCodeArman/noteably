import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-4 font-sans">
       <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-12 relative">
          <Link to="/" className="absolute top-8 left-8 text-gray-400 hover:text-gray-600">
             <ArrowLeft className="w-6 h-6" />
          </Link>
          
          <div className="text-center mb-10 mt-4">
             <h1 className="text-3xl font-serif text-[#1A1A1A] mb-3">Welcome back</h1>
             <p className="text-gray-500">Enter your details to access your account.</p>
          </div>

          <form className="space-y-6">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5F6F52]/20 focus:border-[#5F6F52] transition-all"
                  placeholder="student@university.edu"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5F6F52]/20 focus:border-[#5F6F52] transition-all"
                  placeholder="••••••••"
                />
             </div>
             
             <button className="w-full bg-[#5F6F52] text-white py-3 rounded-xl font-medium hover:bg-[#3A4A30] transition-colors">
                Sign In
             </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500">
             Don't have an account? <a href="#" className="text-[#5F6F52] font-semibold hover:underline">Sign up</a>
          </p>
       </div>
    </div>
  );
}
