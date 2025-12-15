import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Layout as LayoutIcon, FileText, Brain, Zap, LogOut, Menu, X, Upload } from 'lucide-react';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: <LayoutIcon className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/upload', icon: <Upload className="w-5 h-5" />, label: 'Upload' },
    { to: '/notes', icon: <FileText className="w-5 h-5" />, label: 'My Notes' },
    { to: '/flashcards', icon: <Brain className="w-5 h-5" />, label: 'Flashcards' },
    { to: '/quizzes', icon: <Zap className="w-5 h-5" />, label: 'Quizzes' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex font-sans overflow-x-hidden">
      {/* Mobile/Tablet Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-20 px-4 py-3 flex items-center justify-between">
        <span className="text-xl font-serif font-semibold tracking-tight text-[#3A4A30]">Noteably</span>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile/Tablet Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile/Tablet Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-40 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100">
           <span className="text-2xl font-serif font-semibold tracking-tight text-[#3A4A30]">Noteably</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
           {navItems.map((item) => (
             <NavLink 
               key={item.to}
               to={item.to}
               onClick={() => setMobileMenuOpen(false)}
               className={({ isActive }) => 
                 `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                   isActive 
                   ? 'bg-[#5F6F52]/10 text-[#3A4A30]' 
                   : 'text-gray-500 hover:bg-gray-50'
                 }`
               }
             >
               {item.icon}
               {item.label}
             </NavLink>
           ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
           <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-[#5F6F52] text-white flex items-center justify-center font-bold">
                 U
              </div>
              <div className="flex-1 text-sm">
                 <p className="font-medium text-gray-900">User</p>
                 <p className="text-gray-500 text-xs">Free Plan</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <LogOut className="w-4 h-4" />
              </button>
           </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed h-full z-10">
        <div className="p-6">
           <span className="text-2xl font-serif font-semibold tracking-tight text-[#3A4A30]">Noteably</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
           {navItems.map((item) => (
             <NavLink 
               key={item.to}
               to={item.to}
               className={({ isActive }) => 
                 `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                   isActive 
                   ? 'bg-[#5F6F52]/10 text-[#3A4A30]' 
                   : 'text-gray-500 hover:bg-gray-50'
                 }`
               }
             >
               {item.icon}
               {item.label}
             </NavLink>
           ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-[#5F6F52] text-white flex items-center justify-center font-bold">
                 U
              </div>
              <div className="flex-1 text-sm">
                 <p className="font-medium text-gray-900">User</p>
                 <p className="text-gray-500 text-xs">Free Plan</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <LogOut className="w-4 h-4" />
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-24 lg:pt-8">
         {children}
      </main>
    </div>
  );
}
