import React from 'react';
import Layout from '../components/Layout';
import { FileText, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mockData from '../data/mockData.json';

export default function Notes() {
  const navigate = useNavigate();

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <header className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-serif text-[#1A1A1A]">My Notes</h1>
         <div className="flex gap-4">
             <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search notes..." 
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-[#5F6F52] w-64"
                />
             </div>
             <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600">
                <Filter className="w-5 h-5" />
             </button>
         </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockData.notes.map(note => (
           <div 
             key={note.id}
             onClick={() => navigate(`/notes/${note.id}`)}
             className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
           >
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-[#F0F2EB] rounded-lg text-[#5F6F52] group-hover:bg-[#5F6F52] group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                 </div>
                 <span className="text-xs text-gray-400">{formatDate(note.createdAt)}</span>
              </div>
              <h3 className="font-serif text-lg font-medium mb-2 text-[#1A1A1A]">{note.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                 {note.summary}
              </p>
              <div className="flex flex-wrap gap-2">
                 <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600">{note.subject}</span>
                 {note.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600">{tag}</span>
                 ))}
              </div>
           </div>
        ))}
      </div>
    </Layout>
  );
}
