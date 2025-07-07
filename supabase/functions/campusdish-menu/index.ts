
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
        'Accept': 'application/json',
        'User-Agent': 'NutriCheck/1.0'
      },
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`CampusDish API error: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    let campusDishData;
    try {
      campusDishData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Response was:', responseText);
      throw new Error('Invalid JSON response from CampusDish API');
    }

    console.log('Parsed CampusDish API response:', JSON.stringify(campusDishData, null, 2));

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
    console.log('=== TRANSFORMATION DEBUG ===');
    console.log('Data type:', typeof data);
    console.log('Data is array:', Array.isArray(data));
    console.log('Data keys:', data ? Object.keys(data) : 'null/undefined');
    
    if (!data) {
      console.log('No data received');
      return getNoItemsResponse();
    }

    // Log the complete structure to understand the API response
    console.log('Complete data structure:', JSON.stringify(data, null, 2));
    
    // Try multiple possible paths in the CampusDish response
    let itemsFound = false;
    
    // Path 1: Direct array
    if (Array.isArray(data)) {
      console.log('Processing direct array with', data.length, 'items');
      for (const item of data) {
        const transformedItem = transformMenuItem(item, 'Direct Array');
        if (transformedItem) {
          menuItems.push(transformedItem);
          itemsFound = true;
        }
      }
    }
    
    // Path 2: Check common CampusDish API response patterns
    const possiblePaths = [
      'Menu',
      'menus', 
      'MenuSections',
      'LocationFullMenu',
      'LocationFullMenu.Menu',
      'LocationFullMenu.MenuSections',
      'data',
      'items',
      'MenuItems'
    ];
    
    for (const path of possiblePaths) {
      if (!itemsFound) {
        const pathData = getNestedProperty(data, path);
        if (pathData) {
          console.log(`Found data at path: ${path}`, typeof pathData, Array.isArray(pathData) ? `(${pathData.length} items)` : '');
          
          if (Array.isArray(pathData)) {
            for (const section of pathData) {
              console.log('Processing section:', section.Name || section.SectionName || 'Unknown Section');
              
              // Look for items in this section
              const sectionItems = section.MenuItems || section.Items || section.menu_items || section.items || [];
              console.log(`Section has ${sectionItems.length} items`);
              
              for (const item of sectionItems) {
                const transformedItem = transformMenuItem(item, section.Name || section.SectionName || 'General');
                if (transformedItem) {
                  menuItems.push(transformedItem);
                  itemsFound = true;
                }
              }
            }
          }
        }
      }
    }
    
    // Path 3: Deep search for any objects that look like menu items
    if (!itemsFound) {
      console.log('Performing deep search for menu items...');
      const foundItems = deepSearchForMenuItems(data);
      console.log(`Deep search found ${foundItems.length} potential menu items`);
      
      for (const item of foundItems) {
        const transformedItem = transformMenuItem(item, 'Deep Search');
        if (transformedItem) {
          menuItems.push(transformedItem);
          itemsFound = true;
        }
      }
    }
    
    console.log(`=== TRANSFORMATION COMPLETE ===`);
    console.log(`Total items found: ${menuItems.length}`);
    
  } catch (transformError) {
    console.error('Error during transformation:', transformError);
    console.error('Transform error stack:', transformError.stack);
  }

  if (menuItems.length === 0) {
    console.log('No menu items were successfully transformed, returning fallback');
    return getNoItemsResponse();
  }

  return menuItems;
}

function transformMenuItem(item: any, category: string) {
  if (!item || typeof item !== 'object') {
    return null;
  }
  
  // Look for name in various possible fields
  const name = item.Name || item.ItemName || item.MenuItemName || item.DisplayName || item.title || item.Description;
  
  if (!name) {
    console.log('Skipping item without name:', Object.keys(item));
    return null;
  }
  
  console.log(`Transforming item: ${name}`);
  
  return {
    id: `alberta-${item.MenuItemId || item.ItemId || item.Id || Math.random().toString(36).substr(2, 9)}`,
    name: name,
    category: category,
    calories: parseFloat(item.Calories || item.CaloriesPerServing || '0') || 0,
    protein: parseFloat(item.Protein || '0') || 0,
    fat: parseFloat(item.Fat || item.TotalFat || '0') || 0,
    carbs: parseFloat(item.Carbohydrates || item.Carbs || item.TotalCarbohydrates || '0') || 0,
    allergens: item.Allergens ? 
      (typeof item.Allergens === 'string' ? item.Allergens.split(',').map((a: string) => a.trim()) : item.Allergens) : 
      [],
    ingredients: item.Ingredients || item.Description || item.LongDescription || '',
    dietary: extractDietaryInfo(item)
  };
}

function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

function deepSearchForMenuItems(obj: any, items: any[] = []): any[] {
  if (!obj || typeof obj !== 'object') {
    return items;
  }
  
  // Check if this object looks like a menu item
  if (obj.Name || obj.ItemName || obj.MenuItemName) {
    items.push(obj);
  }
  
  // Recursively search nested objects and arrays
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) {
      for (const arrayItem of value) {
        deepSearchForMenuItems(arrayItem, items);
      }
    } else if (value && typeof value === 'object') {
      deepSearchForMenuItems(value, items);
    }
  }
  
  return items;
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

function getNoItemsResponse() {
  return [{
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
