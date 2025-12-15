import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Notes from './pages/Notes';
import NoteDetail from './pages/NoteDetail';
import Flashcards from './pages/Flashcards';
import FlashcardDeck from './pages/FlashcardDeck';
import Quizzes from './pages/Quizzes';
import QuizDetail from './pages/QuizDetail';
import Upload from './pages/Upload';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/:id" element={<NoteDetail />} />
        
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/flashcards/:id" element={<FlashcardDeck />} />
        
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/quizzes/:id" element={<QuizDetail />} />
        
        <Route path="/login" element={<Login />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
