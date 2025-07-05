
import { Leaf, Wheat, Sprout, Recycle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DietaryIconsProps {
  dietary: string[];
}

const DietaryIcons = ({ dietary }: DietaryIconsProps) => {
  const getDietaryInfo = (type: string) => {
    switch (type) {
      case 'vegan':
        return { 
          icon: <Leaf className="w-3 h-3" />, 
          label: 'Vegan', 
          color: 'bg-green-500',
          description: 'Contains no animal products or by-products'
        };
      case 'vegetarian':
        return { 
          icon: <Leaf className="w-3 h-3" />, 
          label: 'Vegetarian', 
          color: 'bg-green-400',
          description: 'Contains no meat, poultry, or fish'
        };
      case 'gluten-free':
        return { 
          icon: <Wheat className="w-3 h-3" />, 
          label: 'Gluten Free', 
          color: 'bg-yellow-500',
          description: 'Does not contain wheat, barley, rye, or other gluten-containing grains'
        };
      case 'halal':
        return { 
          icon: <span className="text-xs font-bold">ح</span>, 
          label: 'Halal', 
          color: 'bg-blue-500',
          description: 'Prepared according to Islamic dietary laws'
        };
      case 'locally-grown':
        return { 
          icon: <Sprout className="w-3 h-3" />, 
          label: 'Local', 
          color: 'bg-emerald-500',
          description: 'Made with locally sourced ingredients from nearby farms'
        };
      case 'sustainable':
        return { 
          icon: <Recycle className="w-3 h-3" />, 
          label: 'Sustainable', 
          color: 'bg-teal-500',
          description: 'Sourced and prepared with environmentally sustainable practices'
        };
      default:
        return null;
    }
  };

  if (!dietary || dietary.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1 mt-2">
        {dietary.map((type, index) => {
          const info = getDietaryInfo(type);
          if (!info) return null;
          
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Badge
                  className={`${info.color} text-white text-xs flex items-center gap-1 px-2 py-1 cursor-help`}
                >
                  {info.icon}
                  <span className="hidden sm:inline">{info.label}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{info.label}</p>
                <p className="text-sm text-gray-600">{info.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default DietaryIcons;
