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
    
    console.log(`Fetching menu for location ${locationId} on date ${date}`);

    // Use the direct URL with embedded credentials as provided
    const directUrl = `https://SvcAcct%40ualberta.ca:%3E&Yyw4o5%5Bu@ualberta.campusdish.com/api/Service.svc/menu/locationfullmenu/${locationId}?date=${date}`;
    
    console.log(`Making request to: ${directUrl}`);
    
    const response = await fetch(directUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NutriCheck/1.0',
        'Cache-Control': 'no-cache'
      },
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response body:', errorText);
      throw new Error(`CampusDish API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('=== RAW CAMPUSDISH RESPONSE ===');
    console.log('Response length:', responseText.length);
    console.log('Full response:', responseText);

    let campusDishData;
    try {
      campusDishData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Response was:', responseText);
      throw new Error('Invalid JSON response from CampusDish API');
    }

    console.log('=== PARSED CAMPUSDISH DATA ===');
    console.log('Full parsed data:', JSON.stringify(campusDishData, null, 2));

    // Transform CampusDish data to match our expected format
    const transformedMenu = transformCampusDishData(campusDishData);
    console.log('=== FINAL TRANSFORMED MENU ===');
    console.log('Menu items count:', transformedMenu.length);
    console.log('Sample items:', transformedMenu.slice(0, 3));

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
  console.log('Input data keys:', data ? Object.keys(data) : 'null');
  
  if (!data) {
    console.log('No data provided to transform');
    return getNoItemsResponse();
  }

  const menuItems = [];
  
  try {
    // Deep recursive search for menu items
    const findMenuItems = (obj: any, path: string = 'root'): any[] => {
      const items = [];
      console.log(`Searching in ${path}:`, typeof obj, Array.isArray(obj) ? `array[${obj.length}]` : Object.keys(obj || {}));
      
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          const item = obj[i];
          if (item && typeof item === 'object') {
            // Check if this looks like a menu item
            const hasNameField = hasAnyField(item, [
              'Name', 'ItemName', 'MenuItemName', 'DisplayName', 'Title',
              'RecipeName', 'ProductName', 'FoodName', 'Description', 'Label',
              'ItemDescription', 'MenuDescription', 'ShortName', 'LongName',
              'FormalName', 'PrintName', 'ServingName', 'FoodItemName', 'ProductTitle'
            ]);
            
            if (hasNameField) {
              console.log(`Found potential menu item at ${path}[${i}]:`, Object.keys(item));
              items.push(item);
            } else {
              // Recursively search nested objects
              items.push(...findMenuItems(item, `${path}[${i}]`));
            }
          }
        }
      } else if (obj && typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          if (value && (Array.isArray(value) || typeof value === 'object')) {
            items.push(...findMenuItems(value, `${path}.${key}`));
          }
        }
      }
      
      return items;
    };
    
    const foundItems = findMenuItems(data);
    console.log(`Found ${foundItems.length} potential menu items`);
    
    // Transform found items
    for (const item of foundItems) {
      const transformedItem = transformMenuItem(item);
      if (transformedItem) {
        menuItems.push(transformedItem);
      }
    }
    
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

function hasAnyField(obj: any, fields: string[]): boolean {
  return fields.some(field => obj[field] && typeof obj[field] === 'string' && obj[field].trim());
}

function transformMenuItem(item: any) {
  console.log('Transforming item:', Object.keys(item));
  
  // Look for name fields
  const possibleNameFields = [
    'Name', 'ItemName', 'MenuItemName', 'DisplayName', 'Title',
    'RecipeName', 'ProductName', 'FoodName', 'Description', 'Label',
    'ItemDescription', 'MenuDescription', 'ShortName', 'LongName',
    'FormalName', 'PrintName', 'ServingName', 'FoodItemName', 'ProductTitle'
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
  
  if (!itemName) {
    console.log('No valid name found for item:', Object.keys(item));
    return null;
  }
  
  console.log(`Found menu item: "${itemName}" using field: ${nameField}`);
  
  // Look for additional nutritional fields
  const nutritionFields = {
    calories: ['Calories', 'CaloriesPerServing', 'Energy', 'Kcal', 'Cal', 'TotalCalories'],
    protein: ['Protein', 'ProteinG', 'ProteinGrams', 'Prot', 'ProteinContent'],
    fat: ['Fat', 'TotalFat', 'FatG', 'FatGrams', 'FatContent'],
    carbs: ['Carbohydrates', 'Carbs', 'TotalCarbohydrates', 'CarbsG', 'CarbGrams', 'CHO', 'CarbContent']
  };
  
  const getNutritionValue = (fields: string[]) => {
    for (const field of fields) {
      if (item[field] !== undefined && item[field] !== null) {
        const value = parseFloat(item[field]);
        if (!isNaN(value)) return value;
      }
    }
    return 0;
  };
  
  const transformedItem = {
    id: `alberta-${item.MenuItemId || item.ItemId || item.Id || item.RecipeId || Math.random().toString(36).substr(2, 9)}`,
    name: itemName,
    category: item.Category || item.CategoryName || item.Section || item.SectionName || item.MenuCategory || 'General',
    calories: getNutritionValue(nutritionFields.calories),
    protein: getNutritionValue(nutritionFields.protein),
    fat: getNutritionValue(nutritionFields.fat),
    carbs: getNutritionValue(nutritionFields.carbs),
    allergens: extractAllergens(item),
    ingredients: item.Ingredients || item.Description || item.LongDescription || item.RecipeDescription || item.ItemDescription || '',
    dietary: extractDietaryInfo(item)
  };
  
  console.log(`Transformed item:`, transformedItem);
  return transformedItem;
}

function extractAllergens(item: any): string[] {
  const allergenFields = ['Allergens', 'AllergenInfo', 'Allergen', 'AllergenList', 'Allergies'];
  
  for (const field of allergenFields) {
    const allergens = item[field];
    
    if (typeof allergens === 'string' && allergens.trim()) {
      return allergens.split(',').map((a: string) => a.trim()).filter(Boolean);
    }
    
    if (Array.isArray(allergens)) {
      return allergens.map(a => typeof a === 'string' ? a : a.Name || a.AllergenName || '').filter(Boolean);
    }
  }
  
  return [];
}

function extractDietaryInfo(item: any): string[] {
  const dietary = [];
  
  // Check various dietary flag fields
  const dietaryFlags = [
    { flags: ['IsVegan', 'Vegan', 'vegan'], label: 'vegan' },
    { flags: ['IsVegetarian', 'Vegetarian', 'vegetarian'], label: 'vegetarian' },
    { flags: ['IsGlutenFree', 'GlutenFree', 'glutenFree', 'GF'], label: 'gluten-free' },
    { flags: ['IsHalal', 'Halal', 'halal'], label: 'halal' },
    { flags: ['IsLocal', 'Local', 'local', 'LocallyGrown'], label: 'locally-grown' },
    { flags: ['IsSustainable', 'Sustainable', 'sustainable'], label: 'sustainable' }
  ];
  
  for (const { flags, label } of dietaryFlags) {
    for (const flag of flags) {
      if (item[flag] === true || item[flag] === 'true' || item[flag] === 1) {
        dietary.push(label);
        break;
      }
    }
  }
  
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
