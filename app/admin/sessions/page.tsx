'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import SessionCard from '@/components/SessionCard';

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

  const handleToggleActive = async (sessionId: string, isActive: boolean) => {
    const action = isActive ? "activate" : "deactivate";
    if (action === 'deactivate' && !confirm('Are you sure you want to deactivate this session?')) {
      return;
    }

    try {
      const response = await fetch('/api/sessions/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId, is_active: isActive ? 1 : 0 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update session');
      }

      fetchSessions(); // Refetch to update the UI
    } catch (err) {
      alert(`Failed to ${action} session: ${(err as Error).message}`);
      console.error(`Error ${action} session:`, err);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/sessions/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete session');
      }

      fetchSessions(); // Refetch to update the UI
    } catch (err) {
      alert(`Failed to delete session: ${(err as Error).message}`);
      console.error('Error deleting session:', err);
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
          {loading ? (
            <p>Loading sessions...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-500">No sessions created yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} onShowQr={showQrCode} onToggleActive={handleToggleActive} onDelete={handleDelete} />
              ))}
            </div>
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