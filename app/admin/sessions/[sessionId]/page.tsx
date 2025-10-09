'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Participant {
  student_id: string;
  name: string;
}

export default function SessionParticipantsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchParticipants() {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/${sessionId}/participants`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data: Participant[] = await response.json();
      setParticipants(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to fetch participants:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionId) return;
    fetchParticipants();
  }, [sessionId]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Session Participants</h1>
        <p className="text-gray-600">Session ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{sessionId}</span></p>
      </div>

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
    </div>
  );
}
