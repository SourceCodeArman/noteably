export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}

// Re-export common types that might be used
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    username?: string;
    password_confirm?: string;
}

// Note types
export interface Note {
    id: string | number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

// Flashcard types
export interface Flashcard {
    id: string | number;
    front: string;
    back: string;
    deck_id?: string | number;
}

export interface FlashcardDeck {
    id: string | number;
    name: string;
    cards: Flashcard[];
}

// Quiz types
export interface Quiz {
    id: string | number;
    title: string;
    questions: QuizQuestion[];
    created_at: string;
}

export interface QuizQuestion {
    id: string | number;
    question: string;
    options: string[];
    correct_answer: number;
}
