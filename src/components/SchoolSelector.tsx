
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';

interface School {
  id: string;
  name: string;
}

interface SchoolSelectorProps {
  schools: School[];
  selectedSchool: string;
  onSchoolChange: (schoolId: string) => void;
}

const SchoolSelector = ({ schools, selectedSchool, onSchoolChange }: SchoolSelectorProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChevronDown className="w-5 h-5" />
          Select Your School
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedSchool} onValueChange={onSchoolChange}>
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
  );
};

export default SchoolSelector;
