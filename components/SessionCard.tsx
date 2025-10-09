import Link from 'next/link';

interface Session {
  id: string;
  created_at: string;
  is_active: number;
  participant_count?: number;
}

interface SessionCardProps {
  session: Session;
  onShowQr: (sessionId: string) => void;
  onToggleActive: (sessionId: string, isActive: boolean) => void;
  onDelete: (sessionId: string) => void;
}

export default function SessionCard({ session, onShowQr, onToggleActive, onDelete }: SessionCardProps) {
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link href={`/admin/sessions/${session.id}`} className="block p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className={`h-3 w-3 rounded-full ${session.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <div>
              <p className="text-lg font-bold text-gray-800 break-all">{session.id}</p>
              <p className="text-xs text-gray-500">Created: {new Date(session.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          {!!session.is_active && session.participant_count && (
            <div className="flex items-center space-x-2 text-gray-600">
              <p className="font-medium">{session.participant_count} Participants</p>
            </div>
          )}
          <div className="flex items-center space-x-2">
            {!!session.is_active && (
              <button onClick={(e) => handleButtonClick(e, () => onShowQr(session.id))} className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors">
                Show QR
              </button>
            )}
            <button onClick={(e) => handleButtonClick(e, () => onToggleActive(session.id, !session.is_active))} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${session.is_active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
              {session.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={(e) => handleButtonClick(e, () => onDelete(session.id))} className="text-gray-500 hover:text-red-600 p-2 rounded-md">
              Delete
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
