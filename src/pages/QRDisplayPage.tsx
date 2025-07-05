import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, QrCode } from 'lucide-react';
import DietaryIcons from '@/components/DietaryIcons';

const QRDisplayPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const nutritionData = location.state?.nutritionData;
  const selectedItemId = location.state?.selectedItemId;

  const handleBack = () => {
    navigate(-1);
  };

  // Generate QR code URL with a link to the static nutrition page
  const generateQRCodeURL = (itemId: string) => {
    if (!itemId) return '';
    
    const nutritionPageURL = `${window.location.origin}/nutrition/${itemId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(nutritionPageURL)}`;
  };

  const renderAdvancedNutrition = (itemDetails: any) => {
    return (
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
    );
  };

  if (!nutritionData || !selectedItemId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">QR Code</h1>
                  <p className="text-gray-600">Share nutrition facts</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No nutrition data available to display QR code.</p>
              <Button onClick={handleBack} className="mt-4">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">QR Code</h1>
                <p className="text-gray-600">Share nutrition facts</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>Scan to View Nutrition Facts</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white p-6 rounded-lg inline-block shadow-sm">
                <img 
                  src={generateQRCodeURL(selectedItemId)}
                  alt="QR Code for Nutrition Facts"
                  className="w-64 h-64 mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Scan this QR code with your phone to view the nutrition information on a static page
              </p>
            </CardContent>
          </Card>

          {/* Nutrition Information */}
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Information Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{nutritionData.name}</h3>
                  <DietaryIcons dietary={nutritionData.dietary} />
                </div>
                
                {renderAdvancedNutrition(nutritionData)}
                
                {/* Allergens */}
                {nutritionData.allergens && nutritionData.allergens.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Allergens</h4>
                    <div className="flex flex-wrap gap-2">
                      {nutritionData.allergens.map((allergen: string, index: number) => (
                        <Badge key={index} variant="destructive">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Ingredients */}
                {nutritionData.ingredients && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Ingredients</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {nutritionData.ingredients}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default QRDisplayPage;
