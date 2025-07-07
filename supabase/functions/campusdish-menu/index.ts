
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
      throw new Error('Invalid JSON response from CampusDish API');
    }

    console.log('=== PARSED CAMPUSDISH DATA ===');
    console.log('Full parsed data:', JSON.stringify(campusDishData, null, 2));

    // Transform CampusDish data to match our expected format
    const transformedMenu = transformCampusDishData(campusDishData, date);
    
    console.log('=== FINAL TRANSFORMED MENU ===');
    console.log('Menu items count:', transformedMenu.length);
    console.log('Transformed menu:', JSON.stringify(transformedMenu, null, 2));

    return new Response(JSON.stringify(transformedMenu), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in campusdish-menu function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function transformCampusDishData(data: any, date: string) {
  console.log('=== STARTING TRANSFORMATION ===');
  console.log('Input data type:', typeof data);
  console.log('Input data exists:', !!data);
  
  if (!data) {
    console.log('No data provided to transform');
    return getNoItemsResponse("No data received from CampusDish API");
  }

  console.log('Data keys:', Object.keys(data));
  
  // Check for different possible root structures
  const possibleRoots = ['MealPeriods', 'mealPeriods', 'Menu', 'menu', 'MenuData', 'menuData'];
  let mealPeriods = null;
  
  for (const root of possibleRoots) {
    if (data[root]) {
      console.log(`Found meal periods under key: ${root}`);
      mealPeriods = data[root];
      break;
    }
  }
  
  if (!mealPeriods) {
    console.log('No meal periods found in any expected location');
    console.log('Available keys:', Object.keys(data));
    return getNoItemsResponse("No meal periods found in the menu data structure");
  }

  if (!Array.isArray(mealPeriods)) {
    console.log('Meal periods is not an array:', typeof mealPeriods);
    return getNoItemsResponse("Meal periods data is not in expected array format");
  }

  console.log(`Found ${mealPeriods.length} meal periods`);
  
  const menuItems = [];
  let totalItemsFound = 0;
  
  for (let mIndex = 0; mIndex < mealPeriods.length; mIndex++) {
    const mealPeriod = mealPeriods[mIndex];
    const mealPeriodName = mealPeriod.Name || mealPeriod.name || `Meal Period ${mIndex + 1}`;
    
    console.log(`\n=== PROCESSING MEAL PERIOD ${mIndex + 1}: ${mealPeriodName} ===`);
    console.log('Meal period keys:', Object.keys(mealPeriod));
    
    // Check for different possible station keys
    const possibleStationKeys = ['Stations', 'stations', 'Station', 'station'];
    let stations = null;
    
    for (const key of possibleStationKeys) {
      if (mealPeriod[key]) {
        console.log(`Found stations under key: ${key}`);
        stations = mealPeriod[key];
        break;
      }
    }
    
    if (!stations || !Array.isArray(stations)) {
      console.log(`No stations found for meal period: ${mealPeriodName}`);
      continue;
    }
    
    console.log(`Found ${stations.length} stations in ${mealPeriodName}`);
    
    for (let sIndex = 0; sIndex < stations.length; sIndex++) {
      const station = stations[sIndex];
      const stationName = station.Name || station.name || `Station ${sIndex + 1}`;
      
      console.log(`\n--- Processing Station ${sIndex + 1}: ${stationName} ---`);
      console.log('Station keys:', Object.keys(station));
      
      // Check for different possible subcategory keys
      const possibleSubcategoryKeys = ['SubCategories', 'subCategories', 'SubCategory', 'subCategory', 'Categories', 'categories'];
      let subCategories = null;
      
      for (const key of possibleSubcategoryKeys) {
        if (station[key]) {
          console.log(`Found subcategories under key: ${key}`);
          subCategories = station[key];
          break;
        }
      }
      
      if (!subCategories || !Array.isArray(subCategories)) {
        console.log(`No subcategories found for station: ${stationName}`);
        continue;
      }
      
      console.log(`Found ${subCategories.length} subcategories in ${stationName}`);
      
      for (let scIndex = 0; scIndex < subCategories.length; scIndex++) {
        const subCategory = subCategories[scIndex];
        const subCategoryName = subCategory.Name || subCategory.name || `SubCategory ${scIndex + 1}`;
        
        console.log(`\n--- Processing SubCategory ${scIndex + 1}: ${subCategoryName} ---`);
        console.log('SubCategory keys:', Object.keys(subCategory));
        
        // Check for different possible item keys
        const possibleItemKeys = ['Items', 'items', 'Item', 'item', 'MenuItems', 'menuItems'];
        let items = null;
        
        for (const key of possibleItemKeys) {
          if (subCategory[key]) {
            console.log(`Found items under key: ${key}`);
            items = subCategory[key];
            break;
          }
        }
        
        if (!items || !Array.isArray(items)) {
          console.log(`No items found for subcategory: ${subCategoryName}`);
          continue;
        }
        
        console.log(`Found ${items.length} items in ${subCategoryName}`);
        totalItemsFound += items.length;
        
        for (let iIndex = 0; iIndex < items.length; iIndex++) {
          const item = items[iIndex];
          console.log(`\n--- Processing Item ${iIndex + 1} ---`);
          console.log('Item keys:', Object.keys(item));
          console.log('Item data:', JSON.stringify(item, null, 2));
          
          const transformedItem = transformMenuItem(item, date, mealPeriodName, stationName, subCategoryName);
          if (transformedItem) {
            menuItems.push(transformedItem);
            console.log(`Successfully transformed item: ${transformedItem.name}`);
          } else {
            console.log('Failed to transform item');
          }
        }
      }
    }
  }
  
  console.log(`\n=== TRANSFORMATION SUMMARY ===`);
  console.log(`Total raw items found: ${totalItemsFound}`);
  console.log(`Successfully transformed items: ${menuItems.length}`);
  
  if (menuItems.length === 0) {
    if (totalItemsFound > 0) {
      return getNoItemsResponse("Menu items were found but failed to transform. Check the logs for details.");
    } else {
      return getNoItemsResponse("Menu data structure found, but no items present under any station. Please check if the date is valid or if the menu is unpublished.");
    }
  }

  return menuItems;
}

function transformMenuItem(item: any, date: string, mealPeriod: string, station: string, subCategory: string) {
  // Look for name fields with more variations
  const possibleNameFields = [
    'Name', 'name', 'ItemName', 'itemName', 'MenuItemName', 'menuItemName', 
    'DisplayName', 'displayName', 'Title', 'title', 'RecipeName', 'recipeName',
    'ProductName', 'productName', 'FoodName', 'foodName', 'Description', 'description'
  ];
  
  let itemName = null;
  for (const field of possibleNameFields) {
    if (item[field] && typeof item[field] === 'string' && item[field].trim()) {
      itemName = item[field].trim();
      console.log(`Found item name: "${itemName}" using field: ${field}`);
      break;
    }
  }
  
  if (!itemName) {
    console.log('No valid name found for item with keys:', Object.keys(item));
    return null;
  }
  
  // Generate a unique ID
  const itemId = `alberta-${item.MenuItemId || item.ItemId || item.Id || item.RecipeId || Math.random().toString(36).substr(2, 9)}`;
  
  const transformedItem = {
    id: itemId,
    name: itemName,
    category: subCategory,
    date: date,
    mealPeriod: mealPeriod,
    station: station,
    subcategory: subCategory,
    servingSize: getFieldValue(item, ['ServingSize', 'servingSize', 'PortionSize', 'portionSize'], 'Not specified'),
    calories: getFieldValue(item, ['Calories', 'calories', 'CaloriesPerServing', 'Energy', 'Kcal'], 0),
    protein: getFieldValue(item, ['Protein', 'protein', 'ProteinG', 'ProteinGrams'], 0),
    fat: getFieldValue(item, ['Fat', 'fat', 'TotalFat', 'totalFat', 'FatG', 'FatGrams'], 0),
    carbs: getFieldValue(item, ['Carbohydrates', 'carbohydrates', 'Carbs', 'carbs', 'TotalCarbohydrates', 'CarbsG'], 0),
    sugars: getFieldValue(item, ['Sugars', 'sugars', 'TotalSugars', 'Sugar', 'sugar'], 0),
    allergens: extractAllergens(item),
    ingredients: item.Ingredients || item.ingredients || item.Description || item.description || '',
    dietary: extractDietaryInfo(item)
  };
  
  console.log(`Transformed item result:`, JSON.stringify(transformedItem, null, 2));
  return transformedItem;
}

function getFieldValue(item: any, fieldNames: string[], defaultValue: any = null) {
  for (const fieldName of fieldNames) {
    if (item[fieldName] !== undefined && item[fieldName] !== null) {
      if (typeof item[fieldName] === 'string') {
        const parsed = parseFloat(item[fieldName]);
        return !isNaN(parsed) ? parsed : item[fieldName];
      }
      return item[fieldName];
    }
  }
  return defaultValue;
}

function extractAllergens(item: any): string[] {
  const allergenFields = ['Allergens', 'allergens', 'AllergenInfo', 'allergenInfo', 'Allergen', 'allergen'];
  
  for (const field of allergenFields) {
    const allergens = item[field];
    
    if (typeof allergens === 'string' && allergens.trim()) {
      if (allergens.toLowerCase().includes('not available')) {
        return ['Allergen Statement Not Available'];
      }
      return allergens.split(',').map((a: string) => a.trim()).filter(Boolean);
    }
    
    if (Array.isArray(allergens)) {
      return allergens.map(a => typeof a === 'string' ? a : a.Name || a.name || '').filter(Boolean);
    }
  }
  
  return ['Allergen Statement Not Available'];
}

function extractDietaryInfo(item: any): string[] {
  const dietary = [];
  
  const dietaryFlags = [
    { flags: ['IsVegan', 'isVegan', 'Vegan', 'vegan'], label: 'vegan' },
    { flags: ['IsVegetarian', 'isVegetarian', 'Vegetarian', 'vegetarian'], label: 'vegetarian' },
    { flags: ['IsGlutenFree', 'isGlutenFree', 'GlutenFree', 'glutenFree', 'GF'], label: 'gluten-free' },
    { flags: ['IsHalal', 'isHalal', 'Halal', 'halal'], label: 'halal' },
    { flags: ['IsLocal', 'isLocal', 'Local', 'local', 'LocallyGrown'], label: 'locally-grown' },
    { flags: ['IsSustainable', 'isSustainable', 'Sustainable', 'sustainable'], label: 'sustainable' }
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

function getNoItemsResponse(message: string) {
  return [{
    id: 'alberta-no-items',
    name: message,
    category: 'Information',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    allergens: [],
    ingredients: 'Please try a different date or check back later when the menu has been published.',
    dietary: []
  }];
}
