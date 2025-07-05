
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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

  // Auto-redirect timer
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Auto-redirecting from QR display page after 1 minute of inactivity');
      navigate(-1);
    }, 60000); // 1 minute = 60,000 milliseconds

    return () => clearTimeout(timer);
  }, [navigate]);

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
    );
  };

  if (!nutritionData || !selectedItemId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 order-2 sm:order-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <QrCode className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">QR Code</h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600">Share nutrition facts</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2 text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2 order-1 sm:order-2 w-full sm:w-auto justify-center touch-manipulation"
                size="sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                Back
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <Card>
            <CardContent className="text-center py-6 sm:py-8">
              <p className="text-sm sm:text-base text-gray-600 mb-4">No nutrition data available to display QR code.</p>
              <Button onClick={handleBack} className="h-11 px-6 touch-manipulation">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 order-2 sm:order-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <QrCode className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">QR Code</h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">Share nutrition facts</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2 order-1 sm:order-2 w-full sm:w-auto justify-center touch-manipulation"
              size="sm"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Scan to View Nutrition Facts</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white p-4 sm:p-6 rounded-lg inline-block shadow-sm">
                <img 
                  src={generateQRCodeURL(selectedItemId)}
                  alt="QR Code for Nutrition Facts"
                  className="w-48 h-48 sm:w-64 sm:h-64 mx-auto"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4 px-2">
                Scan this QR code with your phone to view the nutrition information on a static page
              </p>
            </CardContent>
          </Card>

          {/* Nutrition Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Nutrition Information Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{nutritionData.name}</h3>
                  <DietaryIcons dietary={nutritionData.dietary} />
                </div>
                
                {renderAdvancedNutrition(nutritionData)}
                
                {/* Allergens */}
                {nutritionData.allergens && nutritionData.allergens.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Allergens</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {nutritionData.allergens.map((allergen: string, index: number) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Ingredients */}
                {nutritionData.ingredients && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Ingredients</h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
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
