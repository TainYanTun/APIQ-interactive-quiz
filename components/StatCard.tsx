import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  fetchData: () => Promise<number>;
  color: string;
}

async function StatCardData({ fetchData, color }: { fetchData: () => Promise<number>, color: string }) {
  try {
    const count = await fetchData();
    return <p className={`text-3xl font-bold ${color}`}>{count}</p>;
  } catch (error) {
    console.error(`Error fetching data for ${color} stat card:`, error);
    return <p className="text-red-500">Error</p>;
  }
}

export default function StatCard({ title, fetchData, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <Suspense fallback={<Skeleton className="h-8 w-24 mt-1" />}>
        {/* @ts-expect-error Server Component */}
        <StatCardData fetchData={fetchData} color={color} />
      </Suspense>
    </div>
  );
}
