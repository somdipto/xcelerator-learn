
import React from 'react';
import { RefreshCw, Users } from 'lucide-react';

interface SyncStatusIndicatorProps {
  syncStatus: 'idle' | 'syncing' | 'synced';
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ syncStatus }) => {
  switch (syncStatus) {
    case 'syncing':
      return (
        <div className="flex items-center gap-2 text-[#FFA726]">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Syncing to student portal...</span>
        </div>
      );
    case 'synced':
      return (
        <div className="flex items-center gap-2 text-[#00E676]">
          <Users className="h-4 w-4" />
          <span className="text-sm">✓ Synced with student portal</span>
        </div>
      );
    default:
      return null;
  }
};

export default SyncStatusIndicator;
