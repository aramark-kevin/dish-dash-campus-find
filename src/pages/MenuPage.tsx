
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, ArrowLeft, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchMenu, fetchItem } from '@/services/menuService';
import MenuList from '@/components/MenuList';
import NutritionPanel from '@/components/NutritionPanel';

const schools = [
  { id: 'bishops', name: "Bishop's University", domain: 'ubishops.ca' },
  { id: 'carleton', name: 'Carleton University', domain: 'carleton.ca' },
  { id: 'mcmaster', name: 'McMaster University', domain: 'mcmaster.ca' }
];

const MenuPage = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<string>('');

  // Auto-deselect timer
  useEffect(() => {
    if (!selectedItem) return;

    const timer = setTimeout(() => {
      console.log('Auto-deselecting meal after 1 minute of inactivity');
      setSelectedItem('');
    }, 60000); // 1 minute = 60,000 milliseconds

    return () => clearTimeout(timer);
  }, [selectedItem]);

  const selectedSchool = schools.find(school => school.id === schoolId);

  const { data: menuItems, isLoading: menuLoading, error: menuError } = useQuery({
    queryKey: ['menu', schoolId],
    queryFn: () => fetchMenu(schoolId!),
    enabled: !!schoolId,
  });

  const { data: itemDetails, isLoading: itemLoading, error: itemError } = useQuery({
    queryKey: ['item', selectedItem],
    queryFn: () => fetchItem(selectedItem),
    enabled: !!selectedItem,
  });

  const handleBackToSchoolSelection = () => {
    navigate('/');
  };

  const handleQRDisplay = () => {
    if (selectedItem && itemDetails) {
      navigate('/qr-display', { 
        state: { nutritionData: itemDetails } 
      });
    } else {
      // Show a message or disable button if no item selected
      console.log('Please select a meal first to generate QR code');
    }
  };

  const logoUrl = selectedSchool ? `https://img.logo.dev/${selectedSchool.domain}?token=pk_ZNltVkn2TbKeUEDcbL5Ppg&format=png&size=40` : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={`${selectedSchool?.name} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <Users className={`w-6 h-6 text-white ${logoUrl ? 'hidden' : ''}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">NutriCheck</h1>
                <p className="text-gray-600">{selectedSchool?.name || 'Menu'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleQRDisplay}
                disabled={!selectedItem || !itemDetails}
                className="flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Show QR Code
              </Button>
              <Button
                variant="outline"
                onClick={handleBackToSchoolSelection}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Change School
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <MenuList
            selectedSchool={schoolId || ''}
            selectedItem={selectedItem}
            menuItems={menuItems}
            isLoading={menuLoading}
            error={menuError}
            onItemSelect={setSelectedItem}
          />

          <NutritionPanel
            selectedItem={selectedItem}
            itemDetails={itemDetails}
            isLoading={itemLoading}
            error={itemError}
          />
        </div>
      </main>
    </div>
  );
};

export default MenuPage;
