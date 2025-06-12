
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const SyncStatusBanner: React.FC = () => {
  return (
    <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[#E0E0E0] font-medium mb-1">Real-time Sync Status</h4>
            <p className="text-[#999999] text-sm">
              All content changes are automatically synced to the student portal in real-time.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[#00E676]">
            <div className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live Sync Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncStatusBanner;
