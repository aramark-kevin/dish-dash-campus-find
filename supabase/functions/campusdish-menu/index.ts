
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
    console.log('Raw CampusDish API response:', JSON.stringify(campusDishData, null, 2));

    // Transform CampusDish data to match our expected format
    const transformedMenu = transformCampusDishData(campusDishData);
    console.log('Transformed menu data:', JSON.stringify(transformedMenu, null, 2));

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
  const menuItems = [];
  
  try {
    console.log('Transforming CampusDish data structure...');
    
    // Log the top-level structure
    console.log('Data keys:', Object.keys(data || {}));
    
    // CampusDish API might have different response structures
    // Let's check multiple possible paths
    let menuSections = [];
    
    if (data && Array.isArray(data)) {
      menuSections = data;
      console.log('Data is array, using directly');
    } else if (data && data.Menu && Array.isArray(data.Menu)) {
      menuSections = data.Menu;
      console.log('Using data.Menu array');
    } else if (data && data.menus && Array.isArray(data.menus)) {
      menuSections = data.menus;
      console.log('Using data.menus array');
    } else if (data && data.MenuSections && Array.isArray(data.MenuSections)) {
      menuSections = data.MenuSections;
      console.log('Using data.MenuSections array');
    } else if (data && data.LocationFullMenu && data.LocationFullMenu.Menu) {
      menuSections = data.LocationFullMenu.Menu;
      console.log('Using data.LocationFullMenu.Menu');
    } else {
      console.log('No recognizable menu structure found');
      // If we can't find a standard structure, let's try to extract items from any nested arrays
      const extractItemsFromObject = (obj: any, items: any[] = []) => {
        if (Array.isArray(obj)) {
          obj.forEach(item => extractItemsFromObject(item, items));
        } else if (obj && typeof obj === 'object') {
          // Check if this object looks like a menu item
          if (obj.Name || obj.ItemName || obj.MenuItemName) {
            items.push(obj);
          }
          // Recursively check nested objects
          Object.values(obj).forEach(value => extractItemsFromObject(value, items));
        }
        return items;
      };
      
      const extractedItems = extractItemsFromObject(data);
      console.log('Extracted items from nested structure:', extractedItems.length);
      
      // Convert extracted items directly
      for (const item of extractedItems) {
        const transformedItem = {
          id: `alberta-${item.MenuItemId || item.ItemId || item.Id || Math.random().toString(36).substr(2, 9)}`,
          name: item.Name || item.ItemName || item.MenuItemName || 'Unknown Item',
          category: item.Category || item.Section || 'General',
          calories: parseInt(item.Calories) || 0,
          protein: parseFloat(item.Protein) || 0,
          fat: parseFloat(item.Fat) || 0,
          carbs: parseFloat(item.Carbohydrates || item.Carbs) || 0,
          allergens: item.Allergens ? item.Allergens.split(',').map((a: string) => a.trim()) : [],
          ingredients: item.Ingredients || item.Description || '',
          dietary: extractDietaryInfo(item)
        };
        menuItems.push(transformedItem);
      }
    }
    
    // Process menu sections if we found them
    if (menuSections.length > 0) {
      console.log(`Processing ${menuSections.length} menu sections`);
      
      for (const menuSection of menuSections) {
        console.log('Processing section:', menuSection.Name || 'Unknown Section');
        
        let sectionItems = [];
        if (menuSection.MenuItems && Array.isArray(menuSection.MenuItems)) {
          sectionItems = menuSection.MenuItems;
        } else if (menuSection.Items && Array.isArray(menuSection.Items)) {
          sectionItems = menuSection.Items;
        } else if (menuSection.menu_items && Array.isArray(menuSection.menu_items)) {
          sectionItems = menuSection.menu_items;
        }
        
        console.log(`Found ${sectionItems.length} items in section`);
        
        for (const item of sectionItems) {
          const transformedItem = {
            id: `alberta-${item.MenuItemId || item.ItemId || item.Id || Math.random().toString(36).substr(2, 9)}`,
            name: item.Name || item.ItemName || item.MenuItemName || 'Unknown Item',
            category: menuSection.Name || menuSection.SectionName || 'General',
            calories: parseInt(item.Calories) || 0,
            protein: parseFloat(item.Protein) || 0,
            fat: parseFloat(item.Fat) || 0,
            carbs: parseFloat(item.Carbohydrates || item.Carbs) || 0,
            allergens: item.Allergens ? item.Allergens.split(',').map((a: string) => a.trim()) : [],
            ingredients: item.Ingredients || item.Description || '',
            dietary: extractDietaryInfo(item)
          };
          menuItems.push(transformedItem);
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

  console.log(`Successfully transformed ${menuItems.length} menu items`);
  
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
  if (item.IsVegan || item.Vegan) dietary.push('vegan');
  if (item.IsVegetarian || item.Vegetarian) dietary.push('vegetarian');
  if (item.IsGlutenFree || item.GlutenFree) dietary.push('gluten-free');
  if (item.IsHalal || item.Halal) dietary.push('halal');
  if (item.IsLocal || item.Local) dietary.push('locally-grown');
  if (item.IsSustainable || item.Sustainable) dietary.push('sustainable');
  
  return dietary;
}
