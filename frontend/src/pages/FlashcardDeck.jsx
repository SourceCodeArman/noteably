import React, { useState } from 'react';
import { ArrowLeft, RotateCw, ArrowRight, ArrowLeft as PrevIcon, LayoutGrid, Layers } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import mockData from '../data/mockData.json';

export default function FlashcardDeck() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isStudyMode, setIsStudyMode] = useState(true);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  const deck = mockData.flashcardDecks.find(d => d.id === id);
  const cards = deck ? deck.cards : [];

  if (!deck) {
      return (
          <Layout>
              <div className="text-center py-20">
                  <h2 className="text-2xl font-serif text-[#1A1A1A]">Deck not found</h2>
                  <button onClick={() => navigate('/flashcards')} className="text-[#5F6F52] hover:underline mt-4">Back to Flashcards</button>
              </div>
          </Layout>
      );
  }

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const handleNext = () => {
    if (currentCard < cards.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setCurrentCard(c => c + 1);
    }
  };

  const handlePrev = () => {
    if (currentCard > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setCurrentCard(c => c - 1);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <header className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/flashcards')}
            className="flex items-center text-gray-500 hover:text-[#5F6F52] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Decks
          </button>
          
          <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
             <button 
                onClick={() => setIsStudyMode(true)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${isStudyMode ? 'bg-[#5F6F52] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
             >
                <Layers className="w-4 h-4" /> Study
             </button>
             <button 
                onClick={() => setIsStudyMode(false)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${!isStudyMode ? 'bg-[#5F6F52] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
             >
                <LayoutGrid className="w-4 h-4" /> List
             </button>
          </div>
        </header>

        <h1 className="text-3xl font-serif text-[#1A1A1A] mb-2 text-center">{deck.title}</h1>
        <p className="text-gray-500 text-center mb-8">{currentCard + 1} of {cards.length}</p>

        {isStudyMode ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] overflow-hidden">
             {/* Flip Card Area */}
             <div className="w-full max-w-2xl aspect-[3/2] perspective-1000 relative">
               <AnimatePresence initial={false} custom={direction}>
                 <motion.div 
                    key={currentCard}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 500, damping: 35 },
                      opacity: { duration: 0.15 }
                    }}
                   className="absolute inset-0 cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                 >
                    <motion.div 
                       className="w-full h-full relative preserve-3d"
                       animate={{ rotateY: isFlipped ? 180 : 0 }}
                       transition={{ duration: 0.3 }}
                    >
                       {/* Front */}
                       <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl flex items-center justify-center p-12 border border-gray-100 text-center">
                          <h3 className="text-2xl font-medium text-[#1A1A1A]">{cards[currentCard].front}</h3>
                          <p className="absolute bottom-6 text-gray-400 text-sm">Click to flip</p>
                       </div>
    
                       {/* Back */}
                       <div className="absolute inset-0 backface-hidden bg-[#3A4A30] rounded-3xl shadow-xl flex items-center justify-center p-12 text-center" style={{ transform: 'rotateY(180deg)' }}>
                          <h3 className="text-xl text-white/90 leading-relaxed">{cards[currentCard].back}</h3>
                       </div>
                    </motion.div>
                 </motion.div>
               </AnimatePresence>
             </div>

             {/* Controls */}
             <div className="flex items-center gap-8 mt-12">
                <button 
                  onClick={handlePrev}
                  disabled={currentCard === 0}
                  className="p-4 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                   <PrevIcon className="w-6 h-6" />
                </button>
                <button 
                   onClick={() => setIsFlipped(!isFlipped)}
                   className="p-4 rounded-full bg-[#F0F2EB] text-[#5F6F52] hover:bg-[#E3E8D0] shadow-sm transition-all"
                >
                   <RotateCw className="w-6 h-6" />
                </button>
                <button 
                   onClick={handleNext}
                   disabled={currentCard === cards.length - 1}
                   className="p-4 rounded-full bg-[#5F6F52] text-white hover:bg-[#3A4A30] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                >
                   <ArrowRight className="w-6 h-6" />
                </button>
             </div>
          </div>
        ) : (
          <div className="grid gap-4 max-w-3xl mx-auto w-full">
             {cards.map((card, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 hover:border-[#5F6F52] transition-colors">
                   <div className="flex-1 font-medium text-[#1A1A1A]">{card.front}</div>
                   <div className="hidden md:block w-px bg-gray-200"></div>
                   <div className="flex-1 text-gray-600">{card.back}</div>
                </div>
             ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
