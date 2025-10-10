
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface Question {
  question_id: number;
  text: string;
  answer: string;
  category: string;
  difficulty: number;
  round: number;
  topic: string;
  question_type: string;
  options: string | null;
}

interface QuizControlProps {
  sessionId: string;
}

export default function QuizControl({ sessionId }: QuizControlProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/${sessionId}/questions`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setQuestions(data.data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, setLoading, setError, setQuestions]);

  useEffect(() => {
    fetchQuestions();
  }, [sessionId, fetchQuestions]); // Add sessionId to dependency array

  const handleQuestionSelect = (questionId: string) => {
    const question = questions.find(q => q.question_id === parseInt(questionId));
    setSelectedQuestion(question || null);
  };

  const handleStartQuestion = () => {
    if (selectedQuestion) {
      setCurrentQuestion(selectedQuestion);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Quiz Control</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="question-select" className="text-sm font-medium">
              Select Question
            </label>
            <select
              id="question-select"
              onChange={(e) => handleQuestionSelect(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={loading}
            >
              <option value="">{loading ? 'Loading...' : 'Select a question'}</option>
              {error ? (
                <option value="" disabled>Error loading questions</option>
              ) : (
                questions.map((question) => (
                  <option key={question.question_id} value={question.question_id}>
                    {question.text}
                  </option>
                ))
              )}
            </select>
          </div>

          <Button onClick={handleStartQuestion} disabled={!selectedQuestion}>
            Start Question
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Question</h3>
          {currentQuestion ? (
            <div className="p-4 border rounded-md bg-gray-50">
              <p className="font-semibold">{currentQuestion.text}</p>
              <p className="text-sm text-gray-600">Answer: {currentQuestion.answer}</p>
            </div>
          ) : (
            <p>No question started.</p>
          )}

          <div className="flex space-x-2">
            <Button variant="outline" disabled={!currentQuestion}>
              Mark Correct
            </Button>
            <Button variant="outline" disabled={!currentQuestion}>
              Mark Incorrect
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
