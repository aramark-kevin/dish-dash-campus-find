
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { fetchItem } from '@/services/menuService';
import DietaryIcons from '@/components/DietaryIcons';

const StaticNutritionPage = () => {
  const { itemId } = useParams<{ itemId: string }>();

  const { data: itemDetails, isLoading, error } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => fetchItem(itemId!),
    enabled: !!itemId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 sm:h-8 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-4 sm:h-6 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Card>
            <CardContent className="pt-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm sm:text-base">
                  Failed to load nutrition information. Please try again.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!itemDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-center text-sm sm:text-base">Nutrition information not found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Nutrition Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{itemDetails.name}</h3>
                <DietaryIcons dietary={itemDetails.dietary} />
              </div>
              
              {/* Advanced View - Nutrition Information Panel Style */}
              <div className="border border-gray-900 p-3 sm:p-4 bg-white text-sm sm:text-base">
                <div className="border-b-8 border-gray-900 pb-2 mb-2">
                  <h4 className="font-black text-xl sm:text-2xl">Nutrition Facts</h4>
                  <p className="text-xs sm:text-sm">Per serving</p>
                </div>
                
                <div className="border-b-4 border-gray-900 py-2">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-xl sm:text-2xl">Calories</span>
                    <span className="font-bold text-xl sm:text-2xl">{itemDetails.calories}</span>
                  </div>
                </div>
                
                <div className="py-2 text-right text-xs sm:text-sm font-semibold border-b border-gray-400">
                  % Daily Value*
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between border-b border-gray-400 py-1">
                    <span className="font-bold text-sm sm:text-base">Total Fat {itemDetails.fat}g</span>
                    <span className="font-bold text-sm sm:text-base">{Math.round((itemDetails.fat / 65) * 100)}%</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-400 py-1">
                    <span className="font-bold text-sm sm:text-base">Total Carbohydrate {itemDetails.carbs}g</span>
                    <span className="font-bold text-sm sm:text-base">{Math.round((itemDetails.carbs / 300) * 100)}%</span>
                  </div>
                  
                  <div className="flex justify-between border-b-4 border-gray-900 py-1">
                    <span className="font-bold text-sm sm:text-base">Protein {itemDetails.protein}g</span>
                    <span className="font-bold text-sm sm:text-base">{Math.round((itemDetails.protein / 50) * 100)}%</span>
                  </div>
                </div>
                
                <div className="pt-2 text-xs">
                  <p>*The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.</p>
                </div>
              </div>
              
              {/* Allergens */}
              {itemDetails.allergens && itemDetails.allergens.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Allergens</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {itemDetails.allergens.map((allergen, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Ingredients */}
              {itemDetails.ingredients && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Ingredients</h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {itemDetails.ingredients}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaticNutritionPage;
