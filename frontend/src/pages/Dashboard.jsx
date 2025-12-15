import React from 'react';
import Layout from '../components/Layout';
import { Upload, FileText, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mockData from '../data/mockData.json';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      <header className="mb-8">
         <h1 className="text-3xl font-serif text-[#1A1A1A] mb-2">Welcome back, Alex</h1>
         <p className="text-gray-500">Here's what's happening with your study materials.</p>
      </header>

      {/* Quick Action - Upload */}
      <div 
         onClick={() => navigate('/upload')}
         className="bg-[#1A1A1A] text-white rounded-3xl p-8 mb-10 overflow-hidden relative group cursor-pointer transition-transform hover:scale-[1.01]"
      >
         <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <Upload className="w-6 h-6 text-white" />
               </div>
               <h2 className="text-2xl font-serif mb-2">Upload New Material</h2>
               <p className="text-gray-400 max-w-md">Drag and drop your audio lectures or PDF notes here to instantly generate study aids.</p>
            </div>
            <button className="px-6 py-3 bg-white text-[#1A1A1A] rounded-full font-medium hover:bg-gray-100 transition-colors">
               Start Upload
            </button>
         </div>
         
         {/* Decorative background elements */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#5F6F52] opacity-20 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#93A884] opacity-10 rounded-full blur-2xl -ml-12 -mb-12"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Recent Activity */}
         <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-medium text-[#1A1A1A]">Recent Activity</h2>
               <button className="text-sm text-[#5F6F52] hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
               {mockData.recentActivity.map((activity) => (
                  <div key={activity.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
                     <div className="w-12 h-12 bg-[#F0F2EB] rounded-xl flex items-center justify-center text-[#5F6F52]">
                        <FileText className="w-5 h-5" />
                     </div>
                     <div className="flex-1">
                        <h3 className="font-medium text-[#1A1A1A]">{activity.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                           <Clock className="w-3 h-3" />
                           <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                           <span>•</span>
                           <span>{activity.details.duration || `${activity.details.cardsReviewed || activity.details.score} items`}</span>
                        </div>
                     </div>
                     <button className="p-2 hover:bg-gray-50 rounded-full text-gray-400">
                        <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
               ))}
            </div>
         </div>

         {/* Stats / Quick Stats - keeping static for now or could mock too */}
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
               <h3 className="font-medium text-gray-500 text-sm mb-1 uppercase tracking-wider">Total Notes</h3>
               <p className="text-4xl font-serif text-[#1A1A1A]">{mockData.notes.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
               <h3 className="font-medium text-gray-500 text-sm mb-1 uppercase tracking-wider">Flashcards Mastered</h3>
               <p className="text-4xl font-serif text-[#1A1A1A]">
                  {mockData.flashcardDecks.reduce((acc, deck) => acc + deck.masteredCards, 0)}
               </p>
            </div>
         </div>
      </div>
    </Layout>
  );
}
