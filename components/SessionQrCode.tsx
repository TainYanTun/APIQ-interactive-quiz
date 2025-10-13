import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface SessionQrCodeProps {
  sessionId: string;
}

const SessionQrCode: React.FC<SessionQrCodeProps> = ({ sessionId }) => {
  const [showQr, setShowQr] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/join?session_id=${sessionId}`);
    }
  }, [sessionId]);

  return (
    <>
      <div className="flex flex-col items-center p-6 bg-white">
        <button
          onClick={() => setShowQr(!showQr)}
          className="px-4 py-2 text-sm font-medium bg-white text-black hover:bg-gray-100 border border-gray-300 transition-all duration-200"
        >
          {showQr ? 'Hide QR Code' : 'Show QR Code'}
        </button>
      </div>
      
      {showQr && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowQr(false)}>
          <div className="bg-white p-8 flex flex-col items-center max-w-lg" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-6">Scan to Join Session</p>
            <div className="p-6 bg-white">
              <QRCodeCanvas value={joinUrl} size={400} level="H" />
            </div>
            <p className="text-xs text-gray-500 mt-6 max-w-xs break-all text-center">{joinUrl}</p>
            <button
              onClick={() => setShowQr(false)}
              className="mt-6 px-4 py-2 text-sm font-medium bg-black text-white hover:bg-gray-800 border border-black transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionQrCode;