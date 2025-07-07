
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
    console.log('First 1000 chars:', responseText.substring(0, 1000));
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
    console.log('Constructor:', campusDishData?.constructor?.name);
    
    if (campusDishData && typeof campusDishData === 'object') {
      console.log('Root level keys:', Object.keys(campusDishData));
      console.log('Complete data structure:');
      console.log(JSON.stringify(campusDishData, null, 2));
    }

    // Transform CampusDish data to match our expected format
    const transformedMenu = transformCampusDishData(campusDishData);
    console.log('=== FINAL TRANSFORMED MENU ===');
    console.log('Menu items count:', transformedMenu.length);
    if (transformedMenu.length > 0) {
      console.log('First item sample:', JSON.stringify(transformedMenu[0], null, 2));
    }

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
    // CampusDish API typically returns data in a specific structure
    // Let's check for common patterns in their API responses
    
    console.log('Analyzing data structure...');
    console.log('Type:', typeof data);
    console.log('Is Array:', Array.isArray(data));
    
    if (typeof data === 'object' && data !== null) {
      console.log('Object keys:', Object.keys(data));
      
      // Check each key to see if it contains menu data
      for (const [key, value] of Object.entries(data)) {
        console.log(`Checking key: ${key}, value type: ${typeof value}, is array: ${Array.isArray(value)}`);
        
        if (Array.isArray(value)) {
          console.log(`Key ${key} contains array with ${value.length} items`);
          
          // Check if this array contains menu items
          for (let i = 0; i < Math.min(3, value.length); i++) {
            const item = value[i];
            console.log(`Sample item ${i} in ${key}:`, JSON.stringify(item, null, 2));
          }
          
          // Try to extract menu items from this array
          const extractedItems = extractMenuItemsFromArray(value, key);
          if (extractedItems.length > 0) {
            console.log(`Extracted ${extractedItems.length} items from ${key}`);
            menuItems.push(...extractedItems);
          }
        } else if (value && typeof value === 'object') {
          console.log(`Key ${key} is object with keys:`, Object.keys(value));
          
          // Recursively check nested objects
          const nestedItems = transformCampusDishData(value);
          if (nestedItems.length > 0 && nestedItems[0].id !== 'alberta-no-items') {
            console.log(`Found ${nestedItems.length} items in nested object ${key}`);
            menuItems.push(...nestedItems);
          }
        }
      }
    }

    console.log(`Total items found: ${menuItems.length}`);
    
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

function extractMenuItemsFromArray(array: any[], source: string) {
  const items = [];
  
  for (const item of array) {
    if (!item || typeof item !== 'object') continue;
    
    // Look for various possible field names that indicate this is a menu item
    const possibleNameFields = [
      'Name', 'ItemName', 'MenuItemName', 'DisplayName', 'Title',
      'RecipeName', 'ProductName', 'FoodName', 'Description'
    ];
    
    let itemName = null;
    for (const field of possibleNameFields) {
      if (item[field] && typeof item[field] === 'string') {
        itemName = item[field];
        break;
      }
    }
    
    if (itemName) {
      console.log(`Found menu item: ${itemName} from source: ${source}`);
      
      const transformedItem = {
        id: `alberta-${item.MenuItemId || item.ItemId || item.Id || item.RecipeId || Math.random().toString(36).substr(2, 9)}`,
        name: itemName,
        category: item.Category || item.CategoryName || item.Section || item.SectionName || source || 'General',
        calories: parseFloat(item.Calories || item.CaloriesPerServing || item.Energy || '0') || 0,
        protein: parseFloat(item.Protein || item.ProteinG || '0') || 0,
        fat: parseFloat(item.Fat || item.TotalFat || item.FatG || '0') || 0,
        carbs: parseFloat(item.Carbohydrates || item.Carbs || item.TotalCarbohydrates || item.CarbsG || '0') || 0,
        allergens: extractAllergens(item),
        ingredients: item.Ingredients || item.Description || item.LongDescription || item.RecipeDescription || '',
        dietary: extractDietaryInfo(item)
      };
      
      items.push(transformedItem);
    }
  }
  
  return items;
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
