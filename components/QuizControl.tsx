'use client';

import { useState, useEffect, useRef } from 'react';

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
  currentRound: number;
  scores: Record<string, number>;
  remainingTime: number;
  ineligibleStudents: string[];
  showAnswer: boolean;
}

interface QuizControlProps {
  sessionId: string;
  onScoringModeChange?: (mode: 'individual' | 'department') => void;
}

// Minimalist Enterprise UI Components
type ButtonVariant = 'default' | 'destructive' | 'ghost';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
}

const Button = ({ children, onClick, disabled, variant = 'default', className = '' }: ButtonProps) => {
  const baseStyles = 'px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';
  const variants: Record<ButtonVariant, string> = {
    default: 'bg-black text-white hover:bg-gray-800 border border-black',
    destructive: 'bg-white text-black hover:bg-gray-100 border border-gray-300',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-300'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white border border-gray-300 rounded-md ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: any) => (
  <div className="px-6 py-4 border-b border-gray-300">
    {children}
  </div>
);

const CardTitle = ({ children }: any) => (
  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }: any) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }: any) => (
  <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

const Skeleton = ({ className = '' }: any) => (
  <div className={`animate-pulse bg-gray-100 ${className}`} />
);

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
    const wsUrl = `ws://localhost:3001`;
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
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error details:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.onopen = null;
        ws.current.onmessage = null;
        ws.current.onclose = null;
        ws.current.onerror = null;
        ws.current.close();
      }
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
  const isQuizEnded = quizState?.isQuizEnded;

  return (
    <div className="min-h-screen bg-white text-black p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-light text-black mb-1">Quiz Control Panel</h1>
          <p className="text-sm text-gray-500">ROUND FINISHED: {quizState?.currentRound ? `${quizState.currentRound} ${quizState.isQuizEnded ? "(Quiz Ended)" : "(Ongoing)"}` : 'Not Started'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Mode</span>
            <select
              value={quizState?.scoringMode || 'individual'}
              onChange={(e) => handleScoringModeChange(e.target.value as 'individual' | 'department')}
              className="bg-white text-black border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-500 transition-colors"
              disabled={Boolean(quizState?.isQuizStarted)}
            >
              <option value="individual">Individual</option>
              <option value="department">Department</option>
            </select>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <Button onClick={openPresentationView}>Launch Presentation</Button>
        </div>
      </div>
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Question</CardTitle>
          </CardHeader>
          <CardContent>
            {isQuizEnded ? (
              <div className="py-12 text-center">
                <p className="text-2xl font-light text-black mb-2">Quiz Completed</p>
                <p className="text-sm text-gray-500">All questions have been answered</p>
              </div>
            ) : quizState?.isQuizStarted ? (
              currentQuestion ? (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Question {quizState?.currentQuestionIndex + 1}</span>
                    <p className="text-lg text-black mt-2 leading-relaxed">{currentQuestion.text}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Answer</span>
                    <p className="text-base text-black mt-2">
                      {quizState.showAnswer ? currentQuestion.answer : '••••••••'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500">No more questions available</p>
                </div>
              )
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500">Waiting to start quiz...</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-3">
            <div className="flex gap-2">
              {isQuizEnded ? (
                <Button onClick={() => sendCommand('START_NEW_ROUND')} className="flex-1">
                  Start New Round
                </Button>
              ) : Boolean(!quizState?.isQuizStarted && !isQuizEnded) ? (
                <Button onClick={() => sendCommand('START_QUIZ')} disabled={Boolean(!isConnected || !quizState)} className="flex-1">
                  Start Quiz
                </Button>
              ) : (
                <>
                  <Button onClick={handleNextQuestion} disabled={Boolean(!quizState?.isQuizStarted || quizState.currentQuestionIndex >= questions.length - 1 || !!quizState.activeStudent || isQuizEnded)} className="flex-1">
                    Next Question
                  </Button>
                  <Button onClick={() => sendCommand('TOGGLE_ANSWER_VISIBILITY')} variant="ghost">
                    {quizState?.showAnswer ? 'Hide' : 'Reveal'}
                  </Button>
                </>
              )}
            </div>
            {Boolean(quizState?.isQuizStarted && !isQuizEnded) && (
              <Button onClick={() => sendCommand('END_QUIZ')} variant="destructive" className="w-full">
                End Quiz
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Scores Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            {quizState?.scores ? (
              <div className="space-y-2">
                {Object.entries(quizState.scores)
                  .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
                  .map(([name, score], index) => (
                    <div key={name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-6">{index + 1}</span>
                        <span className="text-sm text-black">{name}</span>
                      </div>
                      <span className="text-sm text-black">{score}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No scores recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Live State Panel */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Live Status</CardTitle>
          </CardHeader>
          <CardContent>
            {quizState ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Timer</span>
                    <p className="text-3xl text-black">{(quizState.remainingTime / 1000).toFixed(1)}s</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Buzzer</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${quizState.isBuzzerActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm text-black">{quizState.isBuzzerActive ? 'ACTIVE' : 'INACTIVE'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Active Participant</span>
                  <p className="text-base text-black">{quizState.activeStudent || '—'}</p>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleJudgeAnswer(true)} disabled={Boolean(quizState.activeStudent === null || isQuizEnded)} className="flex-1">
                      Correct
                    </Button>
                    <Button onClick={() => handleJudgeAnswer(false)} variant="destructive" disabled={Boolean(quizState.activeStudent === null || isQuizEnded)} className="flex-1">
                      Incorrect
                    </Button>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Ineligible</span>
                  <p className="text-sm text-gray-600">
                    {quizState.ineligibleStudents.length > 0 ? quizState.ineligibleStudents.join(', ') : 'None'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Establishing connection...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}