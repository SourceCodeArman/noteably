import React from 'react';
import Layout from '../components/Layout';
import { Plus, Brain, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mockData from '../data/mockData.json';

export default function Flashcards() {
  const navigate = useNavigate();

  return (
    <Layout>
      <header className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-serif text-[#1A1A1A]">Flashcards</h1>
         <button className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Deck
         </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockData.flashcardDecks.map(deck => (
           <div 
             key={deck.id}
             onClick={() => navigate(`/flashcards/${deck.id}`)}
             className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
           >
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-[#F0F2EB] rounded-lg text-[#5F6F52] group-hover:bg-[#5F6F52] group-hover:text-white transition-colors">
                    <Brain className="w-5 h-5" />
                 </div>
                 <button className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                    <MoreVertical className="w-4 h-4" />
                 </button>
              </div>
              <h3 className="font-serif text-lg font-medium mb-2 text-[#1A1A1A]">{deck.title}</h3>
              <p className="text-sm text-gray-500 mb-6">{deck.cards.length} cards</p>
              
              <div className="space-y-2">
                 <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Mastery</span>
                    <span className="text-[#5F6F52] font-medium">{Math.round((deck.masteredCards / deck.totalCards) * 100)}%</span>
                 </div>
                 <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#5F6F52] rounded-full" 
                        style={{ width: `${(deck.masteredCards / deck.totalCards) * 100}%` }}
                    ></div>
                 </div>
              </div>
           </div>
        ))}
      </div>
    </Layout>
  );
}
