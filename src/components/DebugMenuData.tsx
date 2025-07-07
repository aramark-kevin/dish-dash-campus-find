
import { useQuery } from '@tanstack/react-query';
import { fetchMenu } from '@/services/menuService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DebugMenuDataProps {
  schoolId: string;
}

const DebugMenuData = ({ schoolId }: DebugMenuDataProps) => {
  const { data: menuItems, isLoading, error } = useQuery({
    queryKey: ['debug-menu', schoolId],
    queryFn: () => fetchMenu(schoolId),
    enabled: !!schoolId,
  });

  console.log('Debug - Raw menu data:', menuItems);
  console.log('Debug - Data type:', typeof menuItems);
  console.log('Debug - Is array:', Array.isArray(menuItems));
  console.log('Debug - Data length:', menuItems?.length);

  if (isLoading) {
    return <div>Loading debug data...</div>;
  }

  if (error) {
    return <div>Error loading debug data: {error.message}</div>;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Debug: Raw Menu Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>Data Type:</strong> {typeof menuItems}
          </div>
          <div>
            <strong>Is Array:</strong> {Array.isArray(menuItems) ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Length:</strong> {menuItems?.length || 'N/A'}
          </div>
          <div>
            <strong>Raw Data:</strong>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(menuItems, null, 2)}
            </pre>
          </div>
          {Array.isArray(menuItems) && menuItems.length > 0 && (
            <div>
              <strong>First Item Structure:</strong>
              <pre className="mt-2 p-4 bg-blue-50 rounded text-xs overflow-auto">
                {JSON.stringify(menuItems[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugMenuData;
