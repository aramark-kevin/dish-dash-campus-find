
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, QrCode } from 'lucide-react';
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
  onQRDisplay: () => void;
}

const NutritionPanel = ({ selectedItem, itemDetails, isLoading, error, onQRDisplay }: NutritionPanelProps) => {
  const [isAdvanced, setIsAdvanced] = useState(false);

  const toggleView = () => {
    setIsAdvanced(!isAdvanced);
  };

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle>{isAdvanced ? 'Nutrition Information Panel' : 'Nutrition Facts'}</CardTitle>
        {selectedItem && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onQRDisplay}
              disabled={!selectedItem || !itemDetails}
              className="flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleView}
            >
              {isAdvanced ? 'Simple' : 'Advanced'}
            </Button>
          </div>
        )}
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
            
            {!isAdvanced ? (
              /* Simple View */
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
            ) : (
              /* Advanced View - Nutrition Information Panel Style */
              <div className="border border-gray-900 p-4 bg-white">
                <div className="border-b-8 border-gray-900 pb-2 mb-2">
                  <h4 className="font-black text-2xl">Nutrition Facts</h4>
                  <p className="text-sm">Per serving</p>
                </div>
                
                <div className="border-b-4 border-gray-900 py-2">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-2xl">Calories</span>
                    <span className="font-bold text-2xl">{itemDetails.calories}</span>
                  </div>
                </div>
                
                <div className="py-2 text-right text-sm font-semibold border-b border-gray-400">
                  % Daily Value*
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between border-b border-gray-400 py-1">
                    <span className="font-bold">Total Fat {itemDetails.fat}g</span>
                    <span className="font-bold">{Math.round((itemDetails.fat / 65) * 100)}%</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-400 py-1">
                    <span className="font-bold">Total Carbohydrate {itemDetails.carbs}g</span>
                    <span className="font-bold">{Math.round((itemDetails.carbs / 300) * 100)}%</span>
                  </div>
                  
                  <div className="flex justify-between border-b-4 border-gray-900 py-1">
                    <span className="font-bold">Protein {itemDetails.protein}g</span>
                    <span className="font-bold">{Math.round((itemDetails.protein / 50) * 100)}%</span>
                  </div>
                </div>
                
                <div className="pt-2 text-xs">
                  <p>*The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.</p>
                </div>
              </div>
            )}
            
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
