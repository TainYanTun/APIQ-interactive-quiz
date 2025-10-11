
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Question {
  id: number;
  text: string;
  answer: string;
}

interface QuizState {
  isQuizStarted: boolean;
  scoringMode: 'individual' | 'department';
  isBuzzerActive: boolean;
  activeStudent: string | null;
  currentQuestionIndex: number;
  scores: Record<string, number>;
  remainingTime: number;
  ineligibleStudents: string[];
  showAnswer: boolean;
}

export default function QuizControl({ sessionId }: { sessionId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/questions`);
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.data);
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [sessionId]);

  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:3001`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      ws.current?.send(JSON.stringify({ type: 'REGISTER', payload: { role: 'admin', sessionId } }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (['QUIZ_STATE', 'QUIZ_STARTED', 'BUZZER_ACTIVATED', 'SCORES_UPDATED', 'NEW_QUESTION', 'TIMER_UPDATE', 'BUZZER_OPEN'].includes(data.type)) {
        setQuizState(data.payload);
      }
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event);
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error details:', error);
    };

    return () => {
      ws.current?.close();
    };
  }, [sessionId]);

  const sendCommand = (type: string, payload = {}) => {
    ws.current?.send(JSON.stringify({ type, payload: { ...payload, sessionId } }));
  };

  const handleJudgeAnswer = (correct: boolean) => {
    if (quizState?.activeStudent) {
      sendCommand('JUDGE_ANSWER', { correct });
    }
  };

  const handleScoringModeChange = (mode: 'individual' | 'department') => {
    sendCommand('SET_SCORING_MODE', { mode });
  };

  const openPresentationView = () => {
    window.open(`/presentation/${sessionId}`, '_blank');
  };

  if (loading) {
    return <Skeleton className="h-screen w-full" />;
  }

  const currentQuestion = questions[quizState?.currentQuestionIndex ?? 0];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Quiz Control: Session {sessionId}</h1>
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="scoring-mode" className="mr-2">Scoring Mode:</label>
            <select
              id="scoring-mode"
              value={quizState?.scoringMode || 'individual'}
              onChange={(e) => handleScoringModeChange(e.target.value as 'individual' | 'department')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={quizState?.isQuizStarted}
            >
              <option value="individual">Individual</option>
              <option value="department">Department</option>
            </select>
          </div>
          <Button onClick={openPresentationView}>Start Presentation</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Question</h2>
          {quizState?.isQuizStarted ? (
            currentQuestion ? (
              <div>
                <p className="text-lg">Q{quizState?.currentQuestionIndex + 1}: {currentQuestion.text}</p>
                <p className="text-md font-bold mt-2">Answer: {currentQuestion.answer}</p>
              </div>
            ) : (
              <p>No more questions.</p>
            )
          ) : (
            <p>Quiz has not started yet.</p>
          )}
          <div className="mt-4 space-x-2">
            {!quizState?.isQuizStarted ? (
              <Button onClick={() => sendCommand('START_QUIZ')} disabled={!isConnected || !quizState}>
                Start Quiz
              </Button>
            ) : (
              <Button onClick={() => sendCommand('NEXT_QUESTION')} disabled={!quizState?.isQuizStarted || quizState.currentQuestionIndex >= questions.length - 1 || !!quizState.activeStudent}>
                Next Question
              </Button>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Live State</h2>
          {quizState ? (
            <div>
              <p>Timer: {(quizState.remainingTime / 1000).toFixed(1)}s</p>
              <p>Buzzer Active: {quizState.isBuzzerActive ? 'YES' : 'NO'}</p>
              <p>Active Student: {quizState.activeStudent || 'None'}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Button onClick={() => handleJudgeAnswer(true)} disabled={!quizState.activeStudent}>Correct</Button>
                <Button onClick={() => handleJudgeAnswer(false)} variant="destructive" disabled={!quizState.activeStudent}>Incorrect</Button>
              </div>
              <p className="mt-2">Ineligible Students: {quizState.ineligibleStudents.join(', ')}</p>
            </div>
          ) : (
            <p>Waiting for connection...</p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Scores</h2>
          {quizState?.scores ? (
            <ul>
              {Object.entries(quizState.scores).map(([name, score]) => (
                <li key={name}>{name}: {score}</li>
              ))}
            </ul>
          ) : (
            <p>No scores yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
