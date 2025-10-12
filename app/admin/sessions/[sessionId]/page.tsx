'use client';
import { useEffect, useState, useCallback, use } from 'react';
import { useParams } from 'next/navigation';
import Scoreboard from '@/components/Scoreboard';
import QuizControl from '@/components/QuizControl';
import SessionQrCode from '@/components/SessionQrCode';

interface Participant {
  student_id: string;
  name: string;
}

interface Question {
  id: number;
  text: string;
  answer: string;
  category: string;
  difficulty: number;
  round: number;
  topic: string;
  question_type: string;
  options: string | null;
  created_at: string;
  is_active: number;
}

interface SessionDetails {
  id: string;
  name: string;
  created_at: string;
  is_active: number;
}

export default function SessionParticipantsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedQuestionToAdd, setSelectedQuestionToAdd] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'quiz-control' | 'questions' | 'participants' | 'scoreboard'>('quiz-control');
  const [currentScoringMode, setCurrentScoringMode] = useState<'individual' | 'department'>('individual');

  const fetchSessionDetails = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions'); // Fetch all sessions
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data: SessionDetails[] = await response.json();
      const currentSession = data.find(session => session.id === sessionId);
      if (currentSession) {
        setSessionDetails(currentSession);
      } else {
        setError("Session not found");
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to fetch session details:', err);
    }
  }, [sessionId]);

  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/${sessionId}/participants`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
      }
      const data: Participant[] = await response.json();
      setParticipants(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to fetch participants:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, setLoading, setError, setParticipants]);

  const fetchSessionQuestions = useCallback(async () => {
    try {
      setError(null); // Clear previous errors
      const response = await fetch(`/api/sessions/${sessionId}/questions`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setSessionQuestions(data.data || []);
    } catch (err) {
      setError((err as Error).message); // Set error state
      console.error('Failed to fetch session questions:', err);
      setSessionQuestions([]);
    }
  }, [sessionId, setError, setSessionQuestions]);

  const fetchAllQuestions = useCallback(async (category: string = 'all') => {
    try {
      const url = category === 'all' 
        ? '/api/questions' 
        : `/api/questions?category=${encodeURIComponent(category)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setAllQuestions(data.data || []);
    } catch (err) {
      console.error('Failed to fetch all questions:', err);
      setAllQuestions([]);
    }
  }, [setAllQuestions]);

  const fetchCategories = useCallback(async () => {
    try {
      setError(null); // Clear previous errors
      const response = await fetch('/api/questions/categories');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
      }
      const data = await response.json();
      setCategories(data.data || []);
    } catch (err) {
      setError((err as Error).message); // Set error state
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  }, [setError, setCategories]);

  useEffect(() => {
    if (!sessionId) return;
    fetchSessionDetails();
    fetchParticipants();
    fetchSessionQuestions();
    fetchCategories();
  }, [sessionId, fetchSessionDetails, fetchParticipants, fetchSessionQuestions, fetchCategories]);

  useEffect(() => {
    fetchAllQuestions(selectedCategoryFilter);
  }, [fetchAllQuestions, selectedCategoryFilter]);

  const handleRemoveParticipant = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}/participants/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: studentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove participant');
      }

      fetchParticipants(); // Refetch to update the UI
    } catch (err) {
      alert(`Failed to remove participant: ${(err as Error).message}`);
      console.error('Error removing participant:', err);
    }
  };

  const handleRemoveSessionQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to remove this question from the session?')) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove question from session');
      }

      fetchSessionQuestions(); // Refetch to update the UI
    } catch (err) {
      alert(`Failed to remove question: ${(err as Error).message}`);
      console.error('Error removing question from session:', err);
    }
  };

  const handleAddQuestionToSession = async () => {
    if (!selectedQuestionToAdd) {
      alert('Please select a question to add.');
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question_id: parseInt(selectedQuestionToAdd) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add question to session');
      }

      setSelectedQuestionToAdd(''); // Clear selection
      fetchSessionQuestions(); // Refetch to update the UI
    } catch (err) {
      alert(`Failed to add question: ${(err as Error).message}`);
      console.error('Error adding question to session:', err);
    }
  };

  const handleScoringModeChange = useCallback((mode: 'individual' | 'department') => {
    setCurrentScoringMode(mode);
  }, []);

  return (
    <div className="relative space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{sessionDetails?.name || "Session Details"}</h1>
        <p className="text-gray-600 mt-4">Session ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{sessionId}</span></p>
      </div>

      <div className="mb-4 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
          <li className="me-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${selectedTab === 'quiz-control' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setSelectedTab('quiz-control')}
              role="tab"
            >
              Quiz Control
            </button>
          </li>
          <li className="me-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${selectedTab === 'questions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setSelectedTab('questions')}
              role="tab"
            >
              Questions
            </button>
          </li>
          <li className="me-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${selectedTab === 'participants' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setSelectedTab('participants')}
              role="tab"
            >
              Participants
            </button>
          </li>
          <li className="me-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${selectedTab === 'scoreboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setSelectedTab('scoreboard')}
              role="tab"
            >
              Scoreboard
            </button>
          </li>
        </ul>
      </div>

      <div className="flex justify-between items-start">
        <div className="flex-grow">
          {selectedTab === 'participants' && (
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6">
                {loading ? (
                  <p>Loading participants...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : participants.length === 0 ? (
                  <p className="text-gray-500">No participants have joined this session yet.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participants.map((participant) => (
                        <tr key={participant.student_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{participant.student_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleRemoveParticipant(participant.student_id)} className="text-red-600 hover:text-red-900">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'questions' && (
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Session Questions</h2>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedQuestionToAdd}
                    onChange={(e) => setSelectedQuestionToAdd(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select a question to add</option>
                    {allQuestions.map((question) => (
                      <option key={question.id} value={question.id}>
                        {question.text}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddQuestionToSession}
                    disabled={!selectedQuestionToAdd}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Add Question
                  </button>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <p>Loading questions...</p>
                ) : sessionQuestions.length === 0 ? (
                  <p className="text-gray-500">No questions added to this session yet.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Difficulty
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessionQuestions.map((question) => (
                        <tr key={question.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate" title={question.text}>
                              {question.text}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {question.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {question.difficulty}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleRemoveSessionQuestion(question.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
          {selectedTab === 'scoreboard' && (
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <Scoreboard sessionId={sessionId} scoringMode={currentScoringMode} />
            </div>
          )}
          {selectedTab === 'quiz-control' && (
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <QuizControl sessionId={sessionId} onScoringModeChange={handleScoringModeChange} />
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 z-10 m-4">
          <SessionQrCode sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}
