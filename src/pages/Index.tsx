
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Clock, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchMenu, fetchItem } from '@/services/menuService';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  allergens: string[];
  ingredients: string;
}

const schools = [
  { id: 'bishops', name: "Bishop's University" },
  { id: 'carleton', name: 'Carleton University' },
  { id: 'mcmaster', name: 'McMaster University' }
];

const Index = () => {
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');

  const { data: menuItems, isLoading: menuLoading, error: menuError } = useQuery({
    queryKey: ['menu', selectedSchool],
    queryFn: () => fetchMenu(selectedSchool),
    enabled: !!selectedSchool,
  });

  const { data: itemDetails, isLoading: itemLoading, error: itemError } = useQuery({
    queryKey: ['item', selectedItem],
    queryFn: () => fetchItem(selectedItem),
    enabled: !!selectedItem,
  });

  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchool(schoolId);
    setSelectedItem(''); // Reset selected item when school changes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CampusDish</h1>
              <p className="text-gray-600">Meal Finder</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* School Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChevronDown className="w-5 h-5" />
              Select Your School
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSchool} onValueChange={handleSchoolChange}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose your university..." />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Menu Items */}
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
              
              {selectedSchool && menuLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              )}
              
              {selectedSchool && menuError && (
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
                      className="w-full justify-between h-auto p-4"
                      onClick={() => setSelectedItem(item.id)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm opacity-70">{item.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${item.price.toFixed(2)}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nutrition Facts */}
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
              
              {selectedItem && itemLoading && (
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
              
              {selectedItem && itemError && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load nutrition information. Please try again.
                  </AlertDescription>
                </Alert>
              )}
              
              {selectedItem && itemDetails && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">{itemDetails.name}</h3>
                  
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
        </div>
      </main>
    </div>
  );
};

export default Index;
