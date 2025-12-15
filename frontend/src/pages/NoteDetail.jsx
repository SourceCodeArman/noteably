import React, { useState } from 'react';
import { ArrowLeft, Clock, Share2, Download, PlayCircle, BookOpen, Quote } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import mockData from '../data/mockData.json';

export default function NoteDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const note = mockData.notes.find(n => n.id === id);
  const [activeTab, setActiveTab] = useState('summary');

  if (!note) {
      return (
          <Layout>
              <div className="text-center py-20">
                  <h2 className="text-2xl font-serif text-[#1A1A1A]">Note not found</h2>
                  <button onClick={() => navigate('/notes')} className="text-[#5F6F52] hover:underline mt-4">Back to Notes</button>
              </div>
          </Layout>
      );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/notes')}
          className="flex items-center text-gray-500 hover:text-[#5F6F52] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Notes
        </button>

        <header className="mb-8">
           <div className="flex justify-between items-start mb-4">
              <div>
                 <div className="flex gap-2 mb-3">
                    <span className="text-xs font-medium px-2 py-1 bg-[#5F6F52]/10 text-[#5F6F52] rounded-md">{note.subject}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">{new Date(note.createdAt).toLocaleDateString()}</span>
                 </div>
                 <h1 className="text-4xl font-serif text-[#1A1A1A] mb-2">{note.title}</h1>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 text-gray-400 hover:text-[#5F6F52] border border-gray-200 rounded-full hover:bg-gray-50">
                    <Share2 className="w-5 h-5" />
                 </button>
                 <button className="p-2 text-gray-400 hover:text-[#5F6F52] border border-gray-200 rounded-full hover:bg-gray-50">
                    <Download className="w-5 h-5" />
                 </button>
              </div>
           </div>

           <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
              <button className="w-12 h-12 bg-[#5F6F52] rounded-full flex items-center justify-center text-white hover:bg-[#4A5A40] transition-colors shadow-lg">
                 <PlayCircle className="w-6 h-6" />
              </button>
              <div className="flex-1">
                 <div className="h-1 bg-gray-100 rounded-full mb-1">
                    <div className="w-1/3 h-full bg-[#5F6F52] rounded-full"></div>
                 </div>
                 <div className="flex justify-between text-xs text-gray-400">
                    <span>12:45</span>
                    <span>{note.recordingDuration}</span>
                 </div>
              </div>
           </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Main Content */}
           <div className="md:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                 <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-5 h-5 text-[#5F6F52]" />
                    <h2 className="text-xl font-medium text-[#1A1A1A]">Summary</h2>
                 </div>
                 <p className="text-gray-600 leading-relaxed">
                    {note.summary}
                 </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                 <div className="flex items-center gap-2 mb-6">
                    <Quote className="w-5 h-5 text-[#5F6F52]" />
                    <h2 className="text-xl font-medium text-[#1A1A1A]">Key Concepts</h2>
                 </div>
                 <div className="space-y-4">
                    {note.keyConcepts.map((concept, i) => (
                       <div key={i} className="p-4 bg-[#F9F8F6] rounded-xl border border-gray-100">
                          <h3 className="font-medium text-[#1A1A1A] mb-1">{concept.title}</h3>
                          <p className="text-sm text-gray-600">{concept.description}</p>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Sidebar */}
           <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-8">
                 <h3 className="font-medium text-[#1A1A1A] mb-4">Transcript</h3>
                 <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {note.transcript.length > 0 ? (
                        note.transcript.map((entry, i) => (
                           <div key={i} className="group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                              <span className="text-xs font-mono text-[#5F6F52] block mb-1 opacity-60 group-hover:opacity-100">{entry.timestamp}</span>
                              <p className="text-sm text-gray-600">{entry.text}</p>
                           </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400 italic">No transcript available.</p>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
}
