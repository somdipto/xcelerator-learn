
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, FileText, Users, Upload } from 'lucide-react';
import { dataService } from '@/services/dataService';

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
  const [totalMaterials, setTotalMaterials] = useState(0);

  useEffect(() => {
    loadTotalMaterials();
  }, []);

  const loadTotalMaterials = async () => {
    try {
      const { data } = await dataService.getStudyMaterials();
      setTotalMaterials(data?.length || 0);
    } catch (error) {
      console.error('Failed to load total materials:', error);
      setTotalMaterials(0);
    }
  };

  const cards = [
    {
      title: 'Total Subjects',
      value: subjectsCount || 0,
      icon: Book,
      color: 'text-[#2979FF]',
      bgColor: 'bg-[#2979FF]/10'
    },
    {
      title: 'Total Chapters',
      value: chaptersCount || 0,
      icon: FileText,
      color: 'text-[#00E676]',
      bgColor: 'bg-[#00E676]/10'
    },
    {
      title: 'Study Materials',
      value: totalMaterials,
      icon: Upload,
      color: 'text-[#FF7043]',
      bgColor: 'bg-[#FF7043]/10'
    },
    {
      title: 'Active Students',
      value: 0, // Set to 0 as requested since we can't track students yet
      icon: Users,
      color: 'text-[#FFA726]',
      bgColor: 'bg-[#FFA726]/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={index} className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-[#E0E0E0]">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatusCards;
