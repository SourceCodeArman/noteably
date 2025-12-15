import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, Timer, Trophy } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import mockData from '../data/mockData.json';

export default function QuizDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const quiz = mockData.quizzes.find(q => q.id === id);
  const questions = quiz ? quiz.questions : [];

  if (!quiz) {
      return (
          <Layout>
              <div className="text-center py-20">
                  <h2 className="text-2xl font-serif text-[#1A1A1A]">Quiz not found</h2>
                  <button onClick={() => navigate('/quizzes')} className="text-[#5F6F52] hover:underline mt-4">Back to Quizzes</button>
              </div>
          </Layout>
      );
  }

  const handleOptionSelect = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    setIsAnswered(true);
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
           <div className="w-24 h-24 bg-[#F0F2EB] rounded-full flex items-center justify-center mx-auto mb-6 text-[#5F6F52]">
              <Trophy className="w-12 h-12" />
           </div>
           <h2 className="text-3xl font-serif text-[#1A1A1A] mb-2">Quiz Complete!</h2>
           <p className="text-gray-500 mb-8">You scored {score} out of {questions.length}</p>
           
           <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-8 max-w-sm mx-auto">
              <div className="text-4xl font-bold text-[#5F6F52] mb-1">{Math.round((score / questions.length) * 100)}%</div>
              <p className="text-sm text-gray-400 uppercase tracking-wide">Accuracy</p>
           </div>

           <button 
             onClick={() => navigate('/quizzes')}
             className="px-8 py-3 bg-[#5F6F52] text-white rounded-full hover:bg-[#3A4A30] transition-colors"
           >
             Back to Quizzes
           </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-8">
           <button 
             onClick={() => navigate('/quizzes')}
             className="flex items-center text-gray-500 hover:text-[#5F6F52] transition-colors"
           >
             <ArrowLeft className="w-4 h-4 mr-2" />
             Quit Quiz
           </button>
           <div className="flex items-center gap-2 text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-mono">14:20</span>
           </div>
        </header>

        {/* Progress Bar */}
        <div className="mb-8">
           <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestion) / questions.length) * 100)}% completed</span>
           </div>
           <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#5F6F52] rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
              ></div>
           </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
           <h2 className="text-xl font-medium text-[#1A1A1A] mb-8 leading-relaxed">
              {questions[currentQuestion].text}
           </h2>

           <div className="space-y-4 mb-8">
              {questions[currentQuestion].options.map((option, i) => (
                 <button
                    key={i}
                    onClick={() => handleOptionSelect(i)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
                       selectedOption === i 
                       ? 'border-[#5F6F52] bg-[#F0F2EB] text-[#3A4A30]' 
                       : 'border-gray-100 hover:border-gray-200 text-gray-600'
                    } ${
                       isAnswered && i === questions[currentQuestion].correctAnswer
                       ? 'border-green-500 bg-green-50 text-green-700'
                       : ''
                    } ${
                       isAnswered && selectedOption === i && i !== questions[currentQuestion].correctAnswer
                       ? 'border-red-500 bg-red-50 text-red-700'
                       : ''
                    }`}
                 >
                    <span className="flex-1">{option}</span>
                    {selectedOption === i && !isAnswered && (
                       <div className="w-5 h-5 rounded-full border-2 border-[#5F6F52] flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#5F6F52]"></div>
                       </div>
                    )}
                    {isAnswered && i === questions[currentQuestion].correctAnswer && (
                       <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {isAnswered && selectedOption === i && i !== questions[currentQuestion].correctAnswer && (
                       <XCircle className="w-5 h-5 text-red-500" />
                    )}
                 </button>
              ))}
           </div>

           <div className="flex justify-end">
              {!isAnswered ? (
                 <button 
                    onClick={handleSubmit}
                    disabled={selectedOption === null}
                    className="px-8 py-3 bg-[#5F6F52] text-white rounded-xl hover:bg-[#3A4A30] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                 >
                    Submit Answer
                 </button>
              ) : (
                 <button 
                    onClick={handleNext}
                    className="px-8 py-3 bg-[#1A1A1A] text-white rounded-xl hover:bg-black transition-all font-medium flex items-center gap-2"
                 >
                    {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    <ArrowRight className="w-4 h-4" />
                 </button>
              )}
           </div>
        </div>
      </div>
    </Layout>
  );
}
