'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { AllAnswers, AnswerAction } from '@/types';

const initialState: AllAnswers = {};

function answersReducer(state: AllAnswers, action: AnswerAction): AllAnswers {
  switch (action.type) {
    case 'SET_Q1':
      return { ...state, q1: action.payload };
    case 'SET_Q2':
      return { ...state, q2: action.payload };
    case 'SET_Q3':
      return { ...state, q3: action.payload };
    case 'SET_Q4':
      return { ...state, q4: action.payload };
    case 'SET_Q5':
      return { ...state, q5: action.payload };
    case 'SET_Q6':
      return { ...state, q6: action.payload };
    case 'SET_Q7':
      return { ...state, q7: action.payload };
    case 'SET_Q8':
      return { ...state, q8: action.payload };
    case 'SET_Q9':
      return { ...state, q9: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface AnswersContextType {
  answers: AllAnswers;
  dispatch: React.Dispatch<AnswerAction>;
}

const AnswersContext = createContext<AnswersContextType | null>(null);

export function AnswersProvider({ children }: { children: ReactNode }) {
  const [answers, dispatch] = useReducer(answersReducer, initialState);

  return (
    <AnswersContext.Provider value={{ answers, dispatch }}>
      {children}
    </AnswersContext.Provider>
  );
}

export function useAnswers() {
  const context = useContext(AnswersContext);
  if (!context) {
    throw new Error('useAnswers must be used within an AnswersProvider');
  }
  return context;
}

// Helper hook to check completion status
export function useCompletionStatus() {
  const { answers } = useAnswers();

  return {
    q1Complete: !!answers.q1,
    q2Complete: !!answers.q2,
    q3Complete: !!answers.q3,
    q4Complete: !!answers.q4,
    q5Complete: !!answers.q5,
    q6Complete: !!answers.q6,
    q7Complete: !!answers.q7,
    q8Complete: !!answers.q8,
    q9Complete: !!answers.q9,
    allComplete: !!(
      answers.q1 &&
      answers.q2 &&
      answers.q3 &&
      answers.q4 &&
      answers.q5 &&
      answers.q6 &&
      answers.q7 &&
      answers.q8 &&
      answers.q9
    ),
    completedCount: [
      answers.q1,
      answers.q2,
      answers.q3,
      answers.q4,
      answers.q5,
      answers.q6,
      answers.q7,
      answers.q8,
      answers.q9,
    ].filter(Boolean).length,
  };
}
