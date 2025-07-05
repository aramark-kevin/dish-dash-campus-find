
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateSchoolId, sanitizeDisplayText } from '@/utils/validation';
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
    // Validate school ID before navigation
    const validatedSchoolId = validateSchoolId(schoolId);
    if (validatedSchoolId) {
      setSelectedSchool(validatedSchoolId);
      navigate(`/menu/${validatedSchoolId}`);
    } else {
      console.error('Invalid school ID selected:', schoolId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20">
              <img 
                src="/lovable-uploads/354bdc32-9467-4fbd-8335-4ee7db84012a.png" 
                alt="NutriCheck Logo"
                className="w-20 h-20 object-contain"
              />
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
