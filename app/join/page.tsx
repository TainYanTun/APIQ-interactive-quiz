'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function JoinPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [studentId, setStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided. Please scan a valid QR code.');
    }
  }, [sessionId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setError('Please enter your Student ID.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/students/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: studentId, session_id: sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join the session.');
      }

      // On success, redirect the student to their dashboard or quiz page
      router.push('/student/dashboard'); // Assuming /student/dashboard is the destination

    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  if (error && !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Join Quiz Session</h1>
          <p className="text-gray-600">You are joining session: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{sessionId}</span></p>
        </div>
        <form className="space-y-6" onSubmit={handleJoin}>
          <div>
            <label htmlFor="studentId" className="text-sm font-medium text-gray-700 block">Student ID</label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              disabled={isLoading}
            >
              {isLoading ? 'Joining...' : 'Join Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Wrap the component in Suspense to handle the initial render where searchParams are not yet available.
export default function JoinPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinPageContent />
    </Suspense>
  );
}
