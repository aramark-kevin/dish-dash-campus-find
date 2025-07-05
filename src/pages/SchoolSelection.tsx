
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import SchoolSelector from '@/components/SchoolSelector';

const schools = [
  { id: 'bishops', name: "Bishop's University", domain: 'ubishops.ca' },
  { id: 'carleton', name: 'Carleton University', domain: 'carleton.ca' },
  { id: 'mcmaster', name: 'McMaster University', domain: 'mcmaster.ca' }
];

const SchoolSelection = () => {
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const navigate = useNavigate();

  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchool(schoolId);
    // Navigate to menu page with selected school
    navigate(`/menu/${schoolId}`);
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
              <h1 className="text-3xl font-bold text-gray-900">NutriCheck</h1>
              <p className="text-gray-600">by Aramark Canada</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to NutriCheck</h2>
          <p className="text-gray-600">Please select your university to view available meals and nutrition information.</p>
        </div>
        
        <SchoolSelector
          schools={schools}
          selectedSchool={selectedSchool}
          onSchoolChange={handleSchoolChange}
        />
      </main>
    </div>
  );
};

export default SchoolSelection;
