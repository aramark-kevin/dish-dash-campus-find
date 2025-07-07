
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

    if (!response.ok) {
      console.log(`CampusDish API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error response body:', errorText);
      throw new Error(`CampusDish API error: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('=== RAW CAMPUSDISH RESPONSE ===');
    console.log('Response length:', responseText.length);
    console.log('First 500 chars:', responseText.substring(0, 500));
    console.log('Last 500 chars:', responseText.substring(Math.max(0, responseText.length - 500)));

    let campusDishData;
    try {
      campusDishData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Response was:', responseText);
      throw new Error('Invalid JSON response from CampusDish API');
    }

    console.log('=== PARSED CAMPUSDISH DATA ===');
    console.log('Data type:', typeof campusDishData);
    console.log('Is array:', Array.isArray(campusDishData));
    console.log('Keys:', campusDishData ? Object.keys(campusDishData) : 'null');
    console.log('Full structure:', JSON.stringify(campusDishData, null, 2));

    // Transform CampusDish data to match our expected format
    const transformedMenu = transformCampusDishData(campusDishData);
    console.log('=== FINAL TRANSFORMED MENU ===');
    console.log('Menu items count:', transformedMenu.length);
    console.log('Transformed menu:', JSON.stringify(transformedMenu, null, 2));

    return new Response(JSON.stringify(transformedMenu), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in campusdish-menu function:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function transformCampusDishData(data: any) {
  console.log('=== STARTING TRANSFORMATION ===');
  
  if (!data) {
    console.log('No data provided to transform');
    return getNoItemsResponse();
  }

  const menuItems = [];
  
  try {
    // Log the complete structure first
    console.log('Data structure analysis:');
    console.log('- Type:', typeof data);
    console.log('- Is Array:', Array.isArray(data));
    console.log('- Constructor:', data.constructor?.name);
    
    if (typeof data === 'object') {
      console.log('- Object keys:', Object.keys(data));
      console.log('- Object entries count:', Object.entries(data).length);
    }

    // Try different approaches to find menu items
    let foundItems = [];

    // Approach 1: Check if data is directly an array of menu items
    if (Array.isArray(data)) {
      console.log('Approach 1: Direct array processing');
      foundItems = data.filter(item => item && (item.Name || item.ItemName || item.MenuItemName));
      console.log(`Found ${foundItems.length} items in direct array`);
    }

    // Approach 2: Look for common CampusDish API structure patterns
    if (foundItems.length === 0 && typeof data === 'object') {
      console.log('Approach 2: Looking for nested menu structures');
      
      const possibleMenuPaths = [
        'Menu',
        'LocationFullMenu',
        'MenuSections',
        'Sections',
        'Items',
        'MenuItems',
        'Data',
        'Result'
      ];

      for (const path of possibleMenuPaths) {
        if (data[path]) {
          console.log(`Found data at path: ${path}`);
          const pathData = data[path];
          
          if (Array.isArray(pathData)) {
            console.log(`Path ${path} contains array with ${pathData.length} items`);
            
            // Check if items are directly menu items
            const directItems = pathData.filter(item => 
              item && (item.Name || item.ItemName || item.MenuItemName)
            );
            
            if (directItems.length > 0) {
              foundItems = directItems;
              console.log(`Found ${foundItems.length} direct menu items in ${path}`);
              break;
            }
            
            // Check if items are sections containing menu items
            for (const section of pathData) {
              if (section && typeof section === 'object') {
                const sectionItems = section.MenuItems || section.Items || section.menu_items || [];
                if (Array.isArray(sectionItems)) {
                  console.log(`Section "${section.Name || section.SectionName || 'Unknown'}" has ${sectionItems.length} items`);
                  foundItems.push(...sectionItems);
                }
              }
            }
            
            if (foundItems.length > 0) {
              console.log(`Found ${foundItems.length} items from sections in ${path}`);
              break;
            }
          }
        }
      }
    }

    // Approach 3: Deep recursive search
    if (foundItems.length === 0) {
      console.log('Approach 3: Deep recursive search');
      foundItems = deepSearchForMenuItems(data);
      console.log(`Deep search found ${foundItems.length} potential menu items`);
    }

    // Transform found items
    for (const item of foundItems) {
      const transformedItem = transformMenuItem(item);
      if (transformedItem) {
        menuItems.push(transformedItem);
      }
    }

    console.log(`=== TRANSFORMATION SUMMARY ===`);
    console.log(`Input data type: ${typeof data}`);
    console.log(`Raw items found: ${foundItems.length}`);
    console.log(`Successfully transformed: ${menuItems.length}`);
    
  } catch (transformError) {
    console.error('Error during transformation:', transformError);
    console.error('Transform error stack:', transformError.stack);
  }

  if (menuItems.length === 0) {
    console.log('No menu items found, returning fallback response');
    return getNoItemsResponse();
  }

  return menuItems;
}

function transformMenuItem(item: any) {
  if (!item || typeof item !== 'object') {
    return null;
  }
  
  // Try multiple possible name fields
  const name = item.Name || item.ItemName || item.MenuItemName || item.DisplayName || 
               item.title || item.Description || item.RecipeName;
  
  if (!name) {
    console.log('Skipping item without recognizable name field. Item keys:', Object.keys(item));
    return null;
  }
  
  console.log(`Transforming item: "${name}"`);
  
  // Try to find category information
  const category = item.Category || item.CategoryName || item.Section || 
                  item.SectionName || item.MenuSection || 'General';
  
  return {
    id: `alberta-${item.MenuItemId || item.ItemId || item.Id || item.RecipeId || Math.random().toString(36).substr(2, 9)}`,
    name: name,
    category: category,
    calories: parseFloat(item.Calories || item.CaloriesPerServing || item.Energy || '0') || 0,
    protein: parseFloat(item.Protein || item.ProteinG || '0') || 0,
    fat: parseFloat(item.Fat || item.TotalFat || item.FatG || '0') || 0,
    carbs: parseFloat(item.Carbohydrates || item.Carbs || item.TotalCarbohydrates || item.CarbsG || '0') || 0,
    allergens: extractAllergens(item),
    ingredients: item.Ingredients || item.Description || item.LongDescription || item.RecipeDescription || '',
    dietary: extractDietaryInfo(item)
  };
}

function extractAllergens(item: any): string[] {
  const allergens = item.Allergens || item.AllergenInfo || item.Allergen || [];
  
  if (typeof allergens === 'string') {
    return allergens.split(',').map((a: string) => a.trim()).filter(Boolean);
  }
  
  if (Array.isArray(allergens)) {
    return allergens.map(a => typeof a === 'string' ? a : a.Name || a.AllergenName || '').filter(Boolean);
  }
  
  return [];
}

function extractDietaryInfo(item: any): string[] {
  const dietary = [];
  
  // Check various dietary flag fields
  if (item.IsVegan || item.Vegan || item.vegan) dietary.push('vegan');
  if (item.IsVegetarian || item.Vegetarian || item.vegetarian) dietary.push('vegetarian');
  if (item.IsGlutenFree || item.GlutenFree || item.glutenFree) dietary.push('gluten-free');
  if (item.IsHalal || item.Halal || item.halal) dietary.push('halal');
  if (item.IsLocal || item.Local || item.local) dietary.push('locally-grown');
  if (item.IsSustainable || item.Sustainable || item.sustainable) dietary.push('sustainable');
  
  return dietary;
}

function deepSearchForMenuItems(obj: any, items: any[] = [], depth: number = 0): any[] {
  if (depth > 10) return items; // Prevent infinite recursion
  
  if (!obj || typeof obj !== 'object') {
    return items;
  }
  
  // Check if this object looks like a menu item
  if (obj.Name || obj.ItemName || obj.MenuItemName || obj.RecipeName) {
    items.push(obj);
  }
  
  // Recursively search nested objects and arrays
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      for (const arrayItem of value) {
        deepSearchForMenuItems(arrayItem, items, depth + 1);
      }
    } else if (value && typeof value === 'object') {
      deepSearchForMenuItems(value, items, depth + 1);
    }
  }
  
  return items;
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
    ingredients: 'Please check back later or try a different date. The dining hall may not have published their menu for today yet.',
    dietary: []
  }];
}
