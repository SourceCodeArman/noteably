import React from 'react';
import Layout from '../components/Layout';
import { Plus, Clock, Trophy, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mockData from '../data/mockData.json';

export default function Quizzes() {
  const navigate = useNavigate();

  return (
    <Layout>
      <header className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-serif text-[#1A1A1A]">Practice Quizzes</h1>
         <button className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Quiz
         </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockData.quizzes.map(quiz => (
           <div 
             key={quiz.id}
             className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
           >
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-[#F0F2EB] rounded-lg text-[#5F6F52]">
                    <Trophy className="w-5 h-5" />
                 </div>
                 {quiz.lastScore && (
                    <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-md">Score: {quiz.lastScore}%</span>
                 )}
              </div>
              <h3 className="font-serif text-lg font-medium mb-2 text-[#1A1A1A]">{quiz.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                 <span>{quiz.questions.length} Questions</span>
                 <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {quiz.timeEstimate}</span>
              </div>
              
              <button 
                onClick={() => navigate(`/quizzes/${quiz.id}`)}
                className={`w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                    quiz.lastScore 
                    ? 'bg-white border-2 border-[#5F6F52] text-[#5F6F52] hover:bg-[#F0F2EB]' 
                    : 'bg-[#5F6F52] text-white hover:bg-[#3A4A30]'
                }`}
              >
                 {quiz.lastScore ? 'Retake Quiz' : 'Start Quiz'}
                 <ArrowRight className="w-4 h-4" />
              </button>
           </div>
        ))}
      </div>
    </Layout>
  );
}
