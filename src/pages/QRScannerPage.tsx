
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, QrCode } from 'lucide-react';
import DietaryIcons from '@/components/DietaryIcons';

// Mock QR code data - in a real app, this would come from the QR scanner
const qrCodeNutritionData = {
  'qr-sample-1': {
    name: 'Grilled Chicken Caesar Salad',
    calories: 420,
    protein: 35,
    fat: 18,
    carbs: 25,
    allergens: ['Dairy', 'Eggs'],
    ingredients: 'Romaine lettuce, grilled chicken breast, parmesan cheese, croutons, caesar dressing, lemon juice',
    dietary: ['locally-grown']
  }
};

const QRScannerPage = () => {
  const navigate = useNavigate();
  const [scannedData, setScannedData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleBackToMenu = () => {
    navigate(-1);
  };

  const simulateQRScan = () => {
    setIsScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      setScannedData(qrCodeNutritionData['qr-sample-1']);
      setIsScanning(false);
    }, 2000);
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
                <h1 className="text-3xl font-bold text-gray-900">QR Scanner</h1>
                <p className="text-gray-600">Scan nutrition facts</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleBackToMenu}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {!scannedData && (
            <Card>
              <CardHeader>
                <CardTitle>Scan QR Code</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                {!isScanning ? (
                  <div className="space-y-4">
                    <QrCode className="w-16 h-16 mx-auto text-gray-400" />
                    <p className="text-gray-600">Click the button below to simulate QR code scanning</p>
                    <Button onClick={simulateQRScan} className="flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      Simulate QR Scan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="animate-pulse">
                      <QrCode className="w-16 h-16 mx-auto text-orange-500" />
                    </div>
                    <p className="text-gray-600">Scanning QR code...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {scannedData && (
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Information Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{scannedData.name}</h3>
                    <DietaryIcons dietary={scannedData.dietary} />
                  </div>
                  
                  {renderAdvancedNutrition(scannedData)}
                  
                  {/* Allergens */}
                  {scannedData.allergens && scannedData.allergens.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Allergens</h4>
                      <div className="flex flex-wrap gap-2">
                        {scannedData.allergens.map((allergen: string, index: number) => (
                          <Badge key={index} variant="destructive">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Ingredients */}
                  {scannedData.ingredients && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Ingredients</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {scannedData.ingredients}
                      </p>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setScannedData(null)}
                      className="w-full"
                    >
                      Scan Another QR Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default QRScannerPage;
