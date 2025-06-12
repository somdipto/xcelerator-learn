
import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const SyncStatusBanner: React.FC = () => {
  return (
    <div className="mb-6 space-y-3">
      {/* Info Banner */}
      <div className="bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-[#2979FF] mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-[#2979FF] font-medium mb-1">Real-time Sync Enabled</h4>
            <p className="text-sm text-[#E0E0E0]">
              All content uploads are immediately synced to the student portal. 
              Students will see your content as soon as you upload it.
            </p>
          </div>
        </div>
      </div>

      {/* Google Drive Tip */}
      <div className="bg-[#00E676]/10 border border-[#00E676]/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-[#00E676] mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-[#00E676] font-medium mb-1">Google Drive Integration</h4>
            <p className="text-sm text-[#E0E0E0]">
              Use Google Drive links for seamless content sharing. The system automatically 
              embeds your content for students with preview and download options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncStatusBanner;
