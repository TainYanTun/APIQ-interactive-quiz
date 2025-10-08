'use client';

import { useEffect, useState } from 'react';

interface Session {
  id: string;
  created_at: string;
  is_active: number; // Assuming 0 or 1 for boolean
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSessions() {
    try {
      setLoading(true);
      const response = await fetch('/api/sessions');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data: Session[] = await response.json();
      setSessions(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  const createSession = async () => {
    try {
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
      });

      let errorData = { message: 'Unknown error' };
      try {
        errorData = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse error response as JSON:', jsonError);
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      fetchSessions(); // Refetch the list to update the UI
    } catch (err) {
      alert(`Failed to create session: ${(err as Error).message}`);
      console.error('Error creating session:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quiz Sessions</h1>
        <p className="text-gray-600">Manage active and past quiz sessions.</p>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">All Sessions</h2>
          <button onClick={createSession} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create New Session
          </button>
        </div>
        <div className="p-6">
          {sessions.length === 0 ? (
            <p className="text-gray-500">No sessions created yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(session.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${session.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {session.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Add actions here, e.g., view participants, deactivate session */}
                      <button className="text-indigo-600 hover:text-indigo-900">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}