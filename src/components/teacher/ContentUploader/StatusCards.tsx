
import React from 'react';
import { Card } from '@/components/ui/card';
import { BookOpen, FileText, Upload } from 'lucide-react';

interface StatusCardsProps {
  subjectsCount: number;
  chaptersCount: number;
  contentCount: number;
}

const StatusCards: React.FC<StatusCardsProps> = ({
  subjectsCount,
  chaptersCount,
  contentCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Card className="bg-[#1A1A1A] border-[#2C2C2C] p-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-[#2979FF]" />
          <div>
            <div className="text-white font-medium">{subjectsCount} Subjects</div>
            <div className="text-[#999999] text-sm">Available in database</div>
          </div>
        </div>
      </Card>

      <Card className="bg-[#1A1A1A] border-[#2C2C2C] p-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-[#00E676]" />
          <div>
            <div className="text-white font-medium">{chaptersCount} Chapters</div>
            <div className="text-[#999999] text-sm">Synced from curriculum</div>
          </div>
        </div>
      </Card>

      <Card className="bg-[#1A1A1A] border-[#2C2C2C] p-4">
        <div className="flex items-center gap-3">
          <Upload className="h-8 w-8 text-[#FFA726]" />
          <div>
            <div className="text-white font-medium">{contentCount} Content Items</div>
            <div className="text-[#999999] text-sm">Uploaded by you</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatusCards;
