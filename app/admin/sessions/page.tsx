'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Session {
  id: string;
  created_at: string;
  is_active: number; // Assuming 0 or 1 for boolean
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);

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

  const showQrCode = (sessionId: string) => {
    const url = `${window.location.origin}/join?session_id=${sessionId}`;
    setQrCodeValue(url);
  };

  const closeModal = () => {
    setQrCodeValue(null);
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {session.is_active && (
                        <button onClick={() => showQrCode(session.id)} className="text-indigo-600 hover:text-indigo-900">
                          Show QR
                        </button>
                      )}
                      <button className="text-gray-500 hover:text-gray-700">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {qrCodeValue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white p-8 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-center mb-4">Scan to Join Session</h3>
            <QRCodeSVG value={qrCodeValue} size={256} />
            <p className="mt-4 text-center text-gray-600 break-all">{qrCodeValue}</p>
            <button onClick={closeModal} className="mt-6 w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}