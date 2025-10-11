
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface Question {
  id: number;
  text: string;
  answer: string;
}

interface QuizState {
  scoringMode: 'individual' | 'department';
  isBuzzerActive: boolean;
  activeStudent: string | null;
  currentQuestionIndex: number;
  scores: Record<string, number>;
  remainingTime: number;
  showAnswer: boolean;
}

export default function PresentationPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [loading, setLoading] = useState(true);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      if (!sessionId) return;
      try {
        const response = await fetch(`/api/sessions/${sessionId}/questions`);
        if (!response.ok) {
          throw new Error(`Error fetching questions: ${response.status}`);
        }
        const data = await response.json();
        setQuestions(data.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const wsUrl = `ws://${window.location.hostname}:3001`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected for presentation');
      ws.current?.send(JSON.stringify({ type: 'REGISTER', payload: { role: 'spectator', sessionId } }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (['QUIZ_STATE', 'QUIZ_STARTED', 'BUZZER_ACTIVATED', 'SCORES_UPDATED', 'NEW_QUESTION', 'TIMER_UPDATE', 'BUZZER_OPEN'].includes(data.type)) {
        setQuizState(data.payload);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected from presentation');
    };

    return () => {
      ws.current?.close();
    };
  }, [sessionId]);

  if (loading) {
    return <Skeleton className="h-screen w-full bg-gray-900" />;
  }

  const currentQuestion = questions[quizState?.currentQuestionIndex ?? 0];
  const timerExpired = quizState && quizState.remainingTime <= 0;

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center p-12">
      {!quizState ? (
        <h1 className="text-6xl font-bold">Waiting for quiz to start...</h1>
      ) : (
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-8">Question {quizState.currentQuestionIndex + 1}</h1>
          {currentQuestion ? (
            <p className="text-4xl mb-8">{currentQuestion.text}</p>
          ) : (
            <p className="text-4xl mb-8">No more questions.</p>
          )}
          
          {quizState.showAnswer && currentQuestion ? (
            <p className="text-5xl font-bold text-green-400 mb-12">Answer: {currentQuestion.answer}</p>
          ) : timerExpired && !quizState.activeStudent && currentQuestion ? (
            <p className="text-5xl font-bold text-green-400 mb-12">Answer: {currentQuestion.answer}</p>
          ) : (
            <div className="text-8xl font-mono mb-12">{(quizState.remainingTime / 1000).toFixed(1)}s</div>
          )}

          {quizState.activeStudent && (
            <div className="text-4xl font-bold text-yellow-400">
              {quizState.activeStudent} buzzed in!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
