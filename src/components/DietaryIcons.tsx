
import { Leaf, Wheat, Sprout, Recycle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DietaryIconsProps {
  dietary: string[];
}

const DietaryIcons = ({ dietary }: DietaryIconsProps) => {
  const getDietaryInfo = (type: string) => {
    switch (type) {
      case 'vegan':
        return { icon: <Leaf className="w-3 h-3" />, label: 'Vegan', color: 'bg-green-500' };
      case 'vegetarian':
        return { icon: <Leaf className="w-3 h-3" />, label: 'Vegetarian', color: 'bg-green-400' };
      case 'gluten-free':
        return { icon: <Wheat className="w-3 h-3" />, label: 'Gluten Free', color: 'bg-yellow-500' };
      case 'halal':
        return { icon: <span className="text-xs font-bold">ح</span>, label: 'Halal', color: 'bg-blue-500' };
      case 'locally-grown':
        return { icon: <Sprout className="w-3 h-3" />, label: 'Local', color: 'bg-emerald-500' };
      case 'sustainable':
        return { icon: <Recycle className="w-3 h-3" />, label: 'Sustainable', color: 'bg-teal-500' };
      default:
        return null;
    }
  };

  if (!dietary || dietary.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {dietary.map((type, index) => {
        const info = getDietaryInfo(type);
        if (!info) return null;
        
        return (
          <Badge
            key={index}
            className={`${info.color} text-white text-xs flex items-center gap-1 px-2 py-1`}
            title={info.label}
          >
            {info.icon}
            <span className="hidden sm:inline">{info.label}</span>
          </Badge>
        );
      })}
    </div>
  );
};

export default DietaryIcons;
