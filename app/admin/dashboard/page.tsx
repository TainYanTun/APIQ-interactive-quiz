import StatCard from '@/components/StatCard';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function getTotalQuestions(): Promise<number> {
  const response = await fetch(`${BASE_URL}/api/stats/total-questions`, { cache: 'no-store' });
  const data = await response.json();
  return data.total_questions;
}

async function getActiveSessions(): Promise<number> {
  const response = await fetch(`${BASE_URL}/api/stats/active-sessions`, { cache: 'no-store' });
  const data = await response.json();
  return data.active_sessions;
}

async function getTotalStudents(): Promise<number> {
  const response = await fetch(`${BASE_URL}/api/stats/total-students`, { cache: 'no-store' });
  const data = await response.json();
  return data.total_students;
}

export default async function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to the quiz application admin panel.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Questions" fetchData={getTotalQuestions} color="text-blue-600" />
        <StatCard title="Active Sessions" fetchData={getActiveSessions} color="text-green-600" />
        <StatCard title="Total Students" fetchData={getTotalStudents} color="text-purple-600" />
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Completed Quizzes</h3>
          <p className="text-3xl font-bold text-orange-600">1,205</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Dashboard content will be displayed here...</p>
        </div>
      </div>
    </div>
  )
}
