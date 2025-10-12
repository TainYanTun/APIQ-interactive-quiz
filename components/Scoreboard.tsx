'use client';

import { useEffect, useState, useCallback } from 'react';

interface Score {
  name: string;
  score: number;
}

interface ScoreboardProps {
  sessionId: string;
  scoringMode: 'individual' | 'department';
}

export default function Scoreboard({ sessionId, scoringMode }: ScoreboardProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/${sessionId}/scores?mode=${scoringMode}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
      }
      const data: Score[] = await response.json();
      setScores(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to fetch scores:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, scoringMode, setLoading, setError, setScores]);

  useEffect(() => {
    fetchScores();
  }, [sessionId, scoringMode, fetchScores]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Scoreboard</h3>
      {loading ? (
        <p>Loading scores...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="border rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(Array.isArray(scores) ? [...scores] : []).sort((a, b) => b.score - a.score).map((score, index) => (
                <tr key={score.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{score.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{score.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
