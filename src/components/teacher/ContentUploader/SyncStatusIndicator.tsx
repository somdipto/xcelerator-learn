
import React from 'react';
import { CheckCircle, RefreshCw, AlertCircle, Clock } from 'lucide-react';

interface SyncStatusIndicatorProps {
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ syncStatus }) => {
  const getStatusConfig = () => {
    switch (syncStatus) {
      case 'syncing':
        return {
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          text: 'Syncing',
          color: 'text-[#FFA726]',
          bgColor: 'bg-[#FFA726]/10'
        };
      case 'synced':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Synced',
          color: 'text-[#00E676]',
          bgColor: 'bg-[#00E676]/10'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Error',
          color: 'text-[#FF7043]',
          bgColor: 'bg-[#FF7043]/10'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'Ready',
          color: 'text-[#666666]',
          bgColor: 'bg-[#666666]/10'
        };
    }
  };

  const { icon, text, color, bgColor } = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${bgColor}`}>
      <span className={color}>{icon}</span>
      <span className={`text-sm ${color}`}>{text}</span>
    </div>
  );
};

export default SyncStatusIndicator;
