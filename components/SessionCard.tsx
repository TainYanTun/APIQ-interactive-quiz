
import { QRCodeSVG } from 'qrcode.react';

interface Session {
  id: string;
  created_at: string;
  is_active: number;
}

interface SessionCardProps {
  session: Session;
  onShowQr: (sessionId: string) => void;
  onToggleActive: (sessionId: string, isActive: boolean) => void;
}

export default function SessionCard({ session, onShowQr, onToggleActive }: SessionCardProps) {
  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Session ID</p>
            <p className="text-lg font-semibold text-gray-900 break-all">{session.id}</p>
          </div>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${session.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {session.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-500">Created At</p>
          <p className="text-sm text-gray-700">{new Date(session.created_at).toLocaleString()}</p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          {session.is_active && (
            <button onClick={() => onShowQr(session.id)} className="text-indigo-600 hover:text-indigo-900 font-medium">
              Show QR
            </button>
          )}
          <button onClick={() => onToggleActive(session.id, !session.is_active)} className={`font-medium ${session.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}>
            {session.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
}
