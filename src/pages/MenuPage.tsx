
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { fetchMenu, fetchItem } from '@/services/menuService';
import { adminService } from '@/services/adminService';
import { validateSchoolId, sanitizeDisplayText } from '@/utils/validation';
import { APP_CONFIG } from '@/config/constants';
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
  const [showPasscodeDialog, setShowPasscodeDialog] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Validate schoolId on mount
  useEffect(() => {
    if (schoolId && !validateSchoolId(schoolId)) {
      console.warn('Invalid school ID detected, redirecting to home');
      navigate('/');
    }
  }, [schoolId, navigate]);

  // Auto-deselect timer
  useEffect(() => {
    if (!selectedItem) return;

    const timer = setTimeout(() => {
      console.log('Auto-deselecting meal after 1 minute of inactivity');
      setSelectedItem('');
    }, APP_CONFIG.UI.AUTO_DESELECT_TIMEOUT);

    return () => clearTimeout(timer);
  }, [selectedItem]);

  const validatedSchoolId = validateSchoolId(schoolId);
  const selectedSchool = schools.find(school => school.id === validatedSchoolId);

  const { data: menuItems, isLoading: menuLoading, error: menuError } = useQuery({
    queryKey: ['menu', validatedSchoolId],
    queryFn: () => fetchMenu(validatedSchoolId!),
    enabled: !!validatedSchoolId,
  });

  const { data: itemDetails, isLoading: itemLoading, error: itemError } = useQuery({
    queryKey: ['item', selectedItem],
    queryFn: () => fetchItem(selectedItem),
    enabled: !!selectedItem,
  });

  const handleBackToSchoolSelection = () => {
    setShowPasscodeDialog(true);
    setPasscode('');
    setPasscodeError('');
  };

  const handlePasscodeSubmit = () => {
    const result = adminService.validatePasscode(passcode);
    
    if (result.success) {
      setShowPasscodeDialog(false);
      navigate('/');
    } else {
      setPasscodeError(result.error || 'Incorrect passcode');
      setPasscode('');
    }
  };

  const handleQRDisplay = () => {
    if (selectedItem && itemDetails) {
      navigate('/qr-display', { 
        state: { 
          nutritionData: itemDetails,
          selectedItemId: selectedItem
        } 
      });
    } else {
      console.log('Please select a meal first to generate QR code');
    }
  };

  const logoUrl = selectedSchool ? 
    `${APP_CONFIG.LOGO_SERVICE.BASE_URL}/${selectedSchool.domain}?token=${APP_CONFIG.LOGO_SERVICE.TOKEN}&format=${APP_CONFIG.LOGO_SERVICE.FORMAT}&size=${APP_CONFIG.LOGO_SERVICE.DEFAULT_SIZE}` 
    : null;

  // If invalid school ID, don't render the page
  if (schoolId && !validatedSchoolId) {
    return null;
  }

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
                    alt={`${selectedSchool ? sanitizeDisplayText(selectedSchool.name) : 'School'} logo`}
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
                <p className="text-gray-600">{selectedSchool ? sanitizeDisplayText(selectedSchool.name) : 'Menu'}</p>
              </div>
            </div>
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
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <MenuList
            selectedSchool={validatedSchoolId || ''}
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
            onQRDisplay={handleQRDisplay}
          />
        </div>
      </main>

      {/* Passcode Dialog */}
      <Dialog open={showPasscodeDialog} onOpenChange={setShowPasscodeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Passcode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please enter the 4-digit passcode to change schools.
            </p>
            {adminService.isLockedOut() && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">Account temporarily locked due to too many failed attempts.</p>
              </div>
            )}
            <Input
              type="password"
              placeholder="Enter 4-digit passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              className="text-center text-lg tracking-widest"
              disabled={adminService.isLockedOut()}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !adminService.isLockedOut()) {
                  handlePasscodeSubmit();
                }
              }}
            />
            {passcodeError && (
              <p className="text-sm text-red-600">{passcodeError}</p>
            )}
            {!adminService.isLockedOut() && (
              <p className="text-xs text-gray-500">
                Attempts remaining: {adminService.getRemainingAttempts()}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPasscodeDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasscodeSubmit}
                className="flex-1"
                disabled={passcode.length !== 4 || adminService.isLockedOut()}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuPage;
