
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DietaryIcons from '@/components/DietaryIcons';

interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  allergens: string[];
  ingredients: string;
  dietary: string[];
}

interface NutritionPanelProps {
  selectedItem: string;
  itemDetails?: NutritionData;
  isLoading: boolean;
  error: Error | null;
}

const NutritionPanel = ({ selectedItem, itemDetails, isLoading, error }: NutritionPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Facts</CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedItem && (
          <p className="text-gray-500 text-center py-8">
            Select a meal to view nutrition information
          </p>
        )}
        
        {selectedItem && isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        )}
        
        {selectedItem && error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load nutrition information. Please try again.
            </AlertDescription>
          </Alert>
        )}
        
        {selectedItem && itemDetails && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{itemDetails.name}</h3>
              <DietaryIcons dietary={itemDetails.dietary} />
            </div>
            
            {/* Nutrition Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{itemDetails.calories}</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{itemDetails.protein}g</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{itemDetails.fat}g</div>
                <div className="text-sm text-gray-600">Fat</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{itemDetails.carbs}g</div>
                <div className="text-sm text-gray-600">Carbs</div>
              </div>
            </div>
            
            {/* Allergens */}
            {itemDetails.allergens && itemDetails.allergens.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Allergens</h4>
                <div className="flex flex-wrap gap-2">
                  {itemDetails.allergens.map((allergen, index) => (
                    <Badge key={index} variant="destructive">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Ingredients */}
            {itemDetails.ingredients && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Ingredients</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {itemDetails.ingredients}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NutritionPanel;
