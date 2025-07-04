
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertCircle } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
}

interface MenuListProps {
  selectedSchool: string;
  selectedItem: string;
  menuItems?: MenuItem[];
  isLoading: boolean;
  error: Error | null;
  onItemSelect: (itemId: string) => void;
}

const MenuList = ({ 
  selectedSchool, 
  selectedItem, 
  menuItems, 
  isLoading, 
  error, 
  onItemSelect 
}: MenuListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Available Meals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedSchool && (
          <p className="text-gray-500 text-center py-8">
            Please select a school to view available meals
          </p>
        )}
        
        {selectedSchool && isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}
        
        {selectedSchool && error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load menu items. Please try again.
            </AlertDescription>
          </Alert>
        )}
        
        {selectedSchool && menuItems && (
          <div className="space-y-3">
            {menuItems.map((item: MenuItem) => (
              <Button
                key={item.id}
                variant={selectedItem === item.id ? "default" : "outline"}
                className="w-full justify-start h-auto p-4"
                onClick={() => onItemSelect(item.id)}
              >
                <div className="text-left">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm opacity-70">{item.category}</div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MenuList;
