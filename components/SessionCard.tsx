import Link from 'next/link';

interface Session {
  id: string;
  name: string;
  created_at: string;
  is_active: number;
  participant_count?: number;
  question_count?: number;
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
    <div className="group bg-white rounded-lg border border-gray-200 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200">
      <Link href={`/admin/sessions/${session.id}`} className="block p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${session.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                  {session.name}
                </h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${
                  session.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {session.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100">
                  {session.id.slice(0, 8)}...
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between">
          {/* Stats */}
          {(session.participant_count !== undefined || session.question_count !== undefined) && (
            <div className="flex items-center gap-5">
              {session.participant_count !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{session.participant_count}</p>
                    <p className="text-xs text-gray-500">Participants</p>
                  </div>
                </div>
              )}
              {session.question_count !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{session.question_count}</p>
                    <p className="text-xs text-gray-500">Questions</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!!session.is_active && (
              <button 
                onClick={(e) => handleButtonClick(e, () => onShowQr(session.id))} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Show QR
              </button>
            )}
            <button 
              onClick={(e) => handleButtonClick(e, () => onToggleActive(session.id, !session.is_active))} 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                session.is_active 
                  ? 'text-gray-600 bg-gray-100 hover:bg-gray-200' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {session.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button 
              onClick={(e) => handleButtonClick(e, () => onDelete(session.id))} 
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}