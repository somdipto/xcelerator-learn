
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface EnhancedBreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}

const EnhancedBreadcrumb = ({ items, onNavigate }: EnhancedBreadcrumbProps) => {
  const handleClick = (href: string, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  return (
    <div className="bg-[#1A1A1A]/50 px-4 py-3 border-b border-[#2C2C2C]">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb>
          <BreadcrumbList className="text-[#E0E0E0]">
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="/" 
                onClick={(e) => handleClick('/', e)}
                className="flex items-center gap-1 text-[#E0E0E0] hover:text-[#00E676] transition-colors"
              >
                <Home className="h-4 w-4" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4 text-[#666666]" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {item.isActive ? (
                    <BreadcrumbPage className="text-[#00E676] font-medium">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      href={item.href || '#'}
                      onClick={(e) => item.href && handleClick(item.href, e)}
                      className="text-[#E0E0E0] hover:text-[#00E676] transition-colors"
                    >
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default EnhancedBreadcrumb;
