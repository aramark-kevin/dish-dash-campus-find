
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
    console.log('Response text:', responseText);

    let campusDishData;
    try {
      campusDishData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Response was:', responseText);
      throw new Error('Invalid JSON response from CampusDish API');
    }

    console.log('=== PARSED CAMPUSDISH DATA ===');
    console.log('Data:', JSON.stringify(campusDishData, null, 2));

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
  console.log('Input data type:', typeof data);
  console.log('Input data:', JSON.stringify(data, null, 2));
  
  if (!data) {
    console.log('No data provided to transform');
    return getNoItemsResponse();
  }

  const menuItems = [];
  
  try {
    // CampusDish API response structure analysis
    // Let's look for common patterns in CampusDish API responses
    
    // Pattern 1: Direct array of menu items
    if (Array.isArray(data)) {
      console.log('Data is array with', data.length, 'items');
      const extractedItems = extractMenuItemsFromArray(data, 'root');
      menuItems.push(...extractedItems);
    }
    
    // Pattern 2: Object with menu data properties
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      console.log('Data is object with keys:', Object.keys(data));
      
      // Look for menu-related properties
      const menuKeys = ['Menu', 'MenuItems', 'Items', 'Recipes', 'FoodItems', 'LocationMenu', 'FullMenu'];
      
      for (const key of menuKeys) {
        if (data[key]) {
          console.log(`Found menu data in key: ${key}`);
          if (Array.isArray(data[key])) {
            const extractedItems = extractMenuItemsFromArray(data[key], key);
            menuItems.push(...extractedItems);
          } else if (typeof data[key] === 'object') {
            // Recursively check nested objects
            const nestedItems = transformCampusDishData(data[key]);
            if (nestedItems.length > 0 && nestedItems[0].id !== 'alberta-no-items') {
              menuItems.push(...nestedItems);
            }
          }
        }
      }
      
      // Also check all properties for arrays that might contain menu items
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value) && value.length > 0) {
          console.log(`Checking array property: ${key} with ${value.length} items`);
          const extractedItems = extractMenuItemsFromArray(value, key);
          if (extractedItems.length > 0) {
            console.log(`Found ${extractedItems.length} menu items in ${key}`);
            menuItems.push(...extractedItems);
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

  // Remove duplicates based on name
  const uniqueItems = menuItems.filter((item, index, self) => 
    index === self.findIndex(t => t.name === item.name)
  );

  console.log(`Returning ${uniqueItems.length} unique menu items`);
  return uniqueItems;
}

function extractMenuItemsFromArray(array: any[], source: string) {
  console.log(`Extracting from array: ${source}, length: ${array.length}`);
  const items = [];
  
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    console.log(`Processing item ${i}:`, JSON.stringify(item, null, 2));
    
    if (!item || typeof item !== 'object') {
      console.log(`Skipping item ${i}: not an object`);
      continue;
    }
    
    // Look for name fields
    const possibleNameFields = [
      'Name', 'ItemName', 'MenuItemName', 'DisplayName', 'Title',
      'RecipeName', 'ProductName', 'FoodName', 'Description', 'Label'
    ];
    
    let itemName = null;
    let nameField = null;
    for (const field of possibleNameFields) {
      if (item[field] && typeof item[field] === 'string' && item[field].trim()) {
        itemName = item[field].trim();
        nameField = field;
        break;
      }
    }
    
    if (itemName) {
      console.log(`Found menu item: "${itemName}" using field: ${nameField}`);
      
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
      
      console.log(`Transformed item:`, JSON.stringify(transformedItem, null, 2));
      items.push(transformedItem);
    } else {
      console.log(`Skipping item ${i}: no valid name field found. Available fields:`, Object.keys(item));
    }
  }
  
  console.log(`Extracted ${items.length} items from ${source}`);
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
