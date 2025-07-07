
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { locationId, date } = await req.json();
    
    const username = Deno.env.get('CAMPUSDISH_USERNAME');
    const password = Deno.env.get('CAMPUSDISH_PASSWORD');
    
    if (!username || !password) {
      throw new Error('CampusDish credentials not configured');
    }

    // Create basic auth header
    const basicAuth = btoa(`${username}:${password}`);
    
    const campusDishUrl = `https://ualberta.campusdish.com/api/Service.svc/menu/locationfullmenu/${locationId}?date=${date}`;
    
    console.log(`Fetching CampusDish menu from: ${campusDishUrl}`);
    
    const response = await fetch(campusDishUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CampusDish API error: ${response.status} ${response.statusText}`);
    }

    const campusDishData = await response.json();
    console.log('CampusDish API response received');

    // Transform CampusDish data to match our expected format
    const transformedMenu = transformCampusDishData(campusDishData);

    return new Response(JSON.stringify(transformedMenu), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in campusdish-menu function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function transformCampusDishData(data: any) {
  // Transform CampusDish API response to match our menu item format
  const menuItems = [];
  
  try {
    // CampusDish typically returns menu data in a nested structure
    // We'll need to extract menu items and their nutritional information
    if (data && data.Menu && Array.isArray(data.Menu)) {
      for (const menuSection of data.Menu) {
        if (menuSection.MenuItems && Array.isArray(menuSection.MenuItems)) {
          for (const item of menuSection.MenuItems) {
            const transformedItem = {
              id: `alberta-${item.MenuItemId || Math.random().toString(36).substr(2, 9)}`,
              name: item.Name || 'Unknown Item',
              category: menuSection.Name || 'General',
              // Nutritional information
              calories: item.Calories || 0,
              protein: item.Protein || 0,
              fat: item.Fat || 0,
              carbs: item.Carbohydrates || 0,
              allergens: item.Allergens ? item.Allergens.split(',').map((a: string) => a.trim()) : [],
              ingredients: item.Ingredients || '',
              dietary: extractDietaryInfo(item)
            };
            menuItems.push(transformedItem);
          }
        }
      }
    }
  } catch (transformError) {
    console.error('Error transforming CampusDish data:', transformError);
    // Return fallback data if transformation fails
    return [{
      id: 'alberta-fallback',
      name: 'Menu items temporarily unavailable',
      category: 'General',
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      allergens: [],
      ingredients: 'Please try again later',
      dietary: []
    }];
  }

  return menuItems.length > 0 ? menuItems : [{
    id: 'alberta-no-items',
    name: 'No menu items available for this date',
    category: 'General',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    allergens: [],
    ingredients: 'Please check back later or try a different date',
    dietary: []
  }];
}

function extractDietaryInfo(item: any): string[] {
  const dietary = [];
  
  // Common dietary flags from CampusDish
  if (item.IsVegan) dietary.push('vegan');
  if (item.IsVegetarian) dietary.push('vegetarian');
  if (item.IsGlutenFree) dietary.push('gluten-free');
  if (item.IsHalal) dietary.push('halal');
  if (item.IsLocal) dietary.push('locally-grown');
  if (item.IsSustainable) dietary.push('sustainable');
  
  return dietary;
}
