
'use client';

import { useEffect, useState } from 'react';

interface Score {
  student_id: string;
  name: string;
  score: number;
}

interface ScoreboardProps {
  sessionId: string;
}

export default function Scoreboard({ sessionId }: ScoreboardProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchScores() {
    // This is a placeholder. In a real application, you would fetch scores from your backend.
    // For now, we'll use some dummy data.
    const dummyScores: Score[] = [
      { student_id: '1', name: 'Alice', score: 100 },
      { student_id: '2', name: 'Bob', score: 80 },
      { student_id: '3', name: 'Charlie', score: 120 },
    ];
    setScores(dummyScores);
    setLoading(false);
  }

  useEffect(() => {
    fetchScores();
  }, [sessionId]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Scoreboard</h3>
      {loading ? (
        <p>Loading scores...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
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
              {scores.sort((a, b) => b.score - a.score).map((score, index) => (
                <tr key={score.student_id}>
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
