'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

interface Question {
  id: number;
  text: string;
  answer: string;
}

interface QuizState {
  isQuizStarted: boolean;
  isQuizEnded: boolean;
  scoringMode: 'individual' | 'department';
  isBuzzerActive: boolean;
  activeStudent: string | null;
  currentQuestionIndex: number;
  scores: Record<string, number>;
  remainingTime: number;
  ineligibleStudents: string[];
  showAnswer: boolean;
}

interface QuizControlProps {
  sessionId: string;
  onScoringModeChange?: (mode: 'individual' | 'department') => void;
}

export default function QuizControl({ sessionId, onScoringModeChange }: QuizControlProps) {
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
      if (['QUIZ_STATE', 'QUIZ_STARTED', 'BUZZER_ACTIVATED', 'SCORES_UPDATED', 'NEW_QUESTION', 'TIMER_UPDATE', 'BUZZER_OPEN', 'QUIZ_ENDED'].includes(data.type)) {
        setQuizState(data.payload);
        if (data.payload.scoringMode && onScoringModeChange) {
          onScoringModeChange(data.payload.scoringMode);
        }
      }
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event);
      setIsConnected(false);
      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        // Re-initialize WebSocket connection
        if (ws.current) {
          ws.current.close(); // Ensure previous connection is closed
        }
        const wsUrl = `ws://${window.location.hostname}:3001`;
        ws.current = new WebSocket(wsUrl);
      }, 3000); // Reconnect after 3 seconds
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error details:', error);
      // The onerror event is usually followed by onclose, so reconnection logic is primarily in onclose
    };

    return () => {
      ws.current?.close();
    };
  }, [sessionId, onScoringModeChange]);

  const sendCommand = (type: string, payload = {}) => {
    ws.current?.send(JSON.stringify({ type, payload: { ...payload, sessionId } }));
  };

  const handleNextQuestion = () => {
    if (!quizState) return;
    const nextQuestionIndex = quizState.currentQuestionIndex + 1;
    const nextQuestion = questions[nextQuestionIndex];
    if (nextQuestion) {
      sendCommand('NEXT_QUESTION', { questionId: nextQuestion.id });
    } else {
      sendCommand('NEXT_QUESTION');
    }
  };

  const handleJudgeAnswer = (correct: boolean) => {
    if (quizState?.activeStudent) {
      sendCommand('JUDGE_ANSWER', { correct, questionId: questions[quizState.currentQuestionIndex]?.id });
    }
  };

  const handleScoringModeChange = (mode: 'individual' | 'department') => {
    sendCommand('SET_SCORING_MODE', { mode });
    if (onScoringModeChange) {
      onScoringModeChange(mode);
    }
  };

  const openPresentationView = () => {
    window.open(`/presentation/${sessionId}`, '_blank');
  };

  if (loading) {
    return <Skeleton className="h-screen w-full" />;
  }

  const currentQuestion = questions[quizState?.currentQuestionIndex ?? 0];
  const isQuizEnded = quizState?.isQuizEnded; // Use the isQuizEnded from quizState

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quiz Control: Session {sessionId}</h1>
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="scoring-mode" className="mr-2">Scoring Mode:</label>
            <select
              id="scoring-mode"
              value={quizState?.scoringMode || 'individual'}
              onChange={(e) => handleScoringModeChange(e.target.value as 'individual' | 'department')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={Boolean(quizState?.isQuizStarted)}
            >
              <option value="individual">Individual</option>
              <option value="department">Department</option>
            </select>
          </div>
          <Button onClick={openPresentationView}>Start Presentation</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Question</CardTitle>
          </CardHeader>
          <CardContent>
            {isQuizEnded ? (
              <p className="text-xl font-bold">Quiz Ended!</p>
            ) : quizState?.isQuizStarted ? (
              currentQuestion ? (
                <div>
                  <p className="text-lg">Q{quizState?.currentQuestionIndex + 1}: {currentQuestion.text}</p>
                  <p className="text-md font-bold mt-2">Answer: {quizState.showAnswer ? currentQuestion.answer : 'Hidden'}</p>
                </div>
              ) : (
                <p>No more questions.</p>
              )
            ) : (
              <p>Quiz has not started yet.</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-2">
            <div className="flex space-x-2">
              {isQuizEnded ? (
                <Button onClick={() => sendCommand('START_NEW_ROUND')}>
                  Start New Round
                </Button>
              ) : Boolean(!quizState?.isQuizStarted && !isQuizEnded) ? (
                <Button onClick={() => sendCommand('START_QUIZ')} disabled={Boolean(!isConnected || !quizState)}>
                  Start Quiz
                </Button>
              ) : (
                <>
                  <Button onClick={handleNextQuestion} disabled={Boolean(!quizState?.isQuizStarted || quizState.currentQuestionIndex >= questions.length - 1 || !!quizState.activeStudent || isQuizEnded)}>
                    Next Question
                  </Button>
                  <Button onClick={() => sendCommand('TOGGLE_ANSWER_VISIBILITY')}>
                    {quizState?.showAnswer ? 'Hide Answer' : 'Show Answer'}
                  </Button>
                </>
              )}
            </div>
            {Boolean(quizState?.isQuizStarted && !isQuizEnded) && (
              <Button onClick={() => sendCommand('END_QUIZ')} variant="destructive">
                End Quiz
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live State</CardTitle>
          </CardHeader>
          <CardContent>
            {quizState ? (
              <div className="space-y-2">
                <p className="text-lg">Timer: <span className="font-bold">{(quizState.remainingTime / 1000).toFixed(1)}s</span></p>
                <p className="text-lg">Buzzer Active: <span className="font-bold">{quizState.isBuzzerActive ? 'YES' : 'NO'}</span></p>
                <p className="text-lg">Active Student: <span className="font-bold">{quizState.activeStudent || 'None'}</span></p>
                <div className="flex space-x-2 pt-2">
                  <Button onClick={() => handleJudgeAnswer(true)} disabled={Boolean(quizState.activeStudent === null || isQuizEnded)}>Correct</Button>
                  <Button onClick={() => handleJudgeAnswer(false)} variant="destructive" disabled={Boolean(quizState.activeStudent === null || isQuizEnded)}>Incorrect</Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Ineligible Students: {quizState.ineligibleStudents.join(', ')}</p>
              </div>
            ) : (
              <p>Waiting for connection...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {quizState?.scores ? (
              <ul className="space-y-1">
                {Object.entries(quizState.scores)
                  .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) // Sort by score descending
                  .map(([name, score]) => (
                    <li key={name} className="flex justify-between items-center">
                      <span>{name}</span>
                      <span className="font-bold">{score}</span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No scores yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}