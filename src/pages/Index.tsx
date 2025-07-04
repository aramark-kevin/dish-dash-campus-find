
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { fetchMenu, fetchItem } from '@/services/menuService';
import SchoolSelector from '@/components/SchoolSelector';
import MenuList from '@/components/MenuList';
import NutritionPanel from '@/components/NutritionPanel';

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
        <SchoolSelector
          schools={schools}
          selectedSchool={selectedSchool}
          onSchoolChange={handleSchoolChange}
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <MenuList
            selectedSchool={selectedSchool}
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

export default Index;
