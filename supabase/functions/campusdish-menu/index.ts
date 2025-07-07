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
    console.log('First 1000 chars:', responseText.substring(0, 1000));

    let campusDishData;
    try {
      campusDishData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Response was:', responseText);
      throw new Error('Invalid JSON response from CampusDish API');
    }

    console.log('=== PARSED CAMPUSDISH DATA ===');
    console.log('Data structure:', Object.keys(campusDishData));

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
    // CampusDish API response structure analysis
    console.log('Analyzing data structure...');
    
    // Pattern 1: Direct array of menu items
    if (Array.isArray(data)) {
      console.log('Data is array with', data.length, 'items');
      const extractedItems = extractMenuItemsFromArray(data, 'root');
      menuItems.push(...extractedItems);
    }
    
    // Pattern 2: Object with menu data properties
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      console.log('Data is object with keys:', Object.keys(data));
      
      // Look for menu-related properties - expanded list
      const menuKeys = [
        'Menu', 'MenuItems', 'Items', 'Recipes', 'FoodItems', 'LocationMenu', 'FullMenu',
        'MenuData', 'RecipeData', 'ItemData', 'FoodData', 'MenuList', 'RecipeList',
        'LocationMenus', 'DiningLocations', 'Locations', 'Services', 'Categories',
        'Periods', 'MenuPeriods', 'MealPeriods', 'DayParts', 'MenuContent', 'MenuStructure'
      ];
      
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
          // Only process if we haven't already processed this key
          if (!menuKeys.includes(key)) {
            const extractedItems = extractMenuItemsFromArray(value, key);
            if (extractedItems.length > 0) {
              console.log(`Found ${extractedItems.length} menu items in ${key}`);
              menuItems.push(...extractedItems);
            }
          }
        } else if (typeof value === 'object' && value !== null) {
          // Check nested objects too
          console.log(`Checking nested object: ${key}`);
          const nestedItems = transformCampusDishData(value);
          if (nestedItems.length > 0 && nestedItems[0].id !== 'alberta-no-items') {
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
    console.log(`Processing item ${i}:`, typeof item, item ? Object.keys(item) : 'null');
    
    if (!item || typeof item !== 'object') {
      console.log(`Skipping item ${i}: not an object`);
      continue;
    }
    
    // Look for name fields - expanded list including exact CampusDish field names
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
    
    if (itemName) {
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
        category: item.Category || item.CategoryName || item.Section || item.SectionName || item.MenuCategory || source || 'General',
        calories: getNutritionValue(nutritionFields.calories),
        protein: getNutritionValue(nutritionFields.protein),
        fat: getNutritionValue(nutritionFields.fat),
        carbs: getNutritionValue(nutritionFields.carbs),
        allergens: extractAllergens(item),
        ingredients: item.Ingredients || item.Description || item.LongDescription || item.RecipeDescription || item.ItemDescription || '',
        dietary: extractDietaryInfo(item)
      };
      
      console.log(`Transformed item:`, transformedItem);
      items.push(transformedItem);
    } else {
      console.log(`Skipping item ${i}: no valid name field found. Available fields:`, Object.keys(item));
      // Log first few characters of each field to help debug
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'string' && value.length > 0) {
          console.log(`  ${key}: "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`);
        }
      }
    }
  }
  
  console.log(`Extracted ${items.length} items from ${source}`);
  return items;
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
