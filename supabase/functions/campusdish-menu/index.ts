
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
    console.log('First 2000 characters:', responseText.substring(0, 2000));

    let campusDishData;
    try {
      campusDishData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Response was:', responseText);
      throw new Error('Invalid JSON response from CampusDish API');
    }

    console.log('=== PARSED CAMPUSDISH DATA STRUCTURE ===');
    console.log('Root keys:', Object.keys(campusDishData || {}));
    
    // Log the structure in detail
    if (campusDishData?.MealPeriods) {
      console.log(`Found ${campusDishData.MealPeriods.length} meal periods`);
      campusDishData.MealPeriods.forEach((mealPeriod: any, mIndex: number) => {
        console.log(`Meal Period ${mIndex}:`, {
          name: mealPeriod.Name,
          stations: mealPeriod.Stations?.length || 0
        });
        
        if (mealPeriod.Stations) {
          mealPeriod.Stations.forEach((station: any, sIndex: number) => {
            console.log(`  Station ${sIndex}:`, {
              name: station.Name,
              subcategories: station.SubCategories?.length || 0
            });
            
            if (station.SubCategories) {
              station.SubCategories.forEach((subcat: any, scIndex: number) => {
                console.log(`    SubCategory ${scIndex}:`, {
                  name: subcat.Name,
                  items: subcat.Items?.length || 0
                });
                
                if (subcat.Items && subcat.Items.length > 0) {
                  subcat.Items.slice(0, 3).forEach((item: any, iIndex: number) => {
                    console.log(`      Item ${iIndex}:`, {
                      name: item.Name || item.ItemName || item.DisplayName,
                      keys: Object.keys(item)
                    });
                  });
                }
              });
            }
          });
        }
      });
    } else {
      console.log('No MealPeriods found in response');
    }

    // Transform CampusDish data to match our expected format
    const transformedMenu = transformCampusDishData(campusDishData, date);
    console.log('=== FINAL TRANSFORMED MENU ===');
    console.log('Menu items count:', transformedMenu.length);
    
    if (transformedMenu.length > 0) {
      console.log('Sample transformed items:', transformedMenu.slice(0, 3));
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

function transformCampusDishData(data: any, date: string) {
  console.log('=== STARTING TRANSFORMATION ===');
  console.log('Input data type:', typeof data);
  console.log('Input data keys:', data ? Object.keys(data) : 'null');
  
  if (!data) {
    console.log('No data provided to transform');
    return getNoItemsResponse("No data received from CampusDish API");
  }

  const menuItems = [];
  let totalItemsFound = 0;
  
  try {
    // Navigate through MealPeriods → Stations → SubCategories → Items
    if (data.MealPeriods && Array.isArray(data.MealPeriods)) {
      console.log(`Processing ${data.MealPeriods.length} meal periods`);
      
      for (const mealPeriod of data.MealPeriods) {
        const mealPeriodName = mealPeriod.Name || 'Unknown Meal Period';
        console.log(`Processing meal period: ${mealPeriodName}`);
        
        if (mealPeriod.Stations && Array.isArray(mealPeriod.Stations)) {
          console.log(`  Found ${mealPeriod.Stations.length} stations in ${mealPeriodName}`);
          
          for (const station of mealPeriod.Stations) {
            const stationName = station.Name || 'Unknown Station';
            console.log(`  Processing station: ${stationName}`);
            
            if (station.SubCategories && Array.isArray(station.SubCategories)) {
              console.log(`    Found ${station.SubCategories.length} subcategories in ${stationName}`);
              
              for (const subCategory of station.SubCategories) {
                const subCategoryName = subCategory.Name || 'Unknown SubCategory';
                console.log(`    Processing subcategory: ${subCategoryName}`);
                
                if (subCategory.Items && Array.isArray(subCategory.Items)) {
                  console.log(`      Found ${subCategory.Items.length} items in ${subCategoryName}`);
                  totalItemsFound += subCategory.Items.length;
                  
                  for (const item of subCategory.Items) {
                    const transformedItem = transformMenuItem(item, date, mealPeriodName, stationName, subCategoryName);
                    if (transformedItem) {
                      menuItems.push(transformedItem);
                      console.log(`      Transformed item: ${transformedItem.name}`);
                    }
                  }
                } else {
                  console.log(`      No items found in subcategory: ${subCategoryName}`);
                }
              }
            } else {
              console.log(`    No subcategories found in station: ${stationName}`);
            }
          }
        } else {
          console.log(`  No stations found in meal period: ${mealPeriodName}`);
        }
      }
    } else {
      console.log('No MealPeriods array found in data');
      console.log('Available top-level keys:', Object.keys(data));
    }
    
    console.log(`Total raw items found: ${totalItemsFound}`);
    console.log(`Successfully transformed items: ${menuItems.length}`);
    
  } catch (transformError) {
    console.error('Error during transformation:', transformError);
    console.error('Transform error stack:', transformError.stack);
  }

  if (menuItems.length === 0) {
    if (totalItemsFound > 0) {
      console.log('Items were found but transformation failed');
      return getNoItemsResponse("Menu data structure found, but failed to transform items. Please check the logs for details.");
    } else if (data.MealPeriods && data.MealPeriods.length > 0) {
      console.log('MealPeriods exist but no items found');
      return getNoItemsResponse("Menu data structure found, but no items present under any station. Please check if the date is valid or if the menu is unpublished.");
    } else {
      console.log('No menu structure found');
      return getNoItemsResponse("No menu data structure found for this date. The dining hall may not have published their menu yet.");
    }
  }

  // Remove duplicates based on name
  const uniqueItems = menuItems.filter((item, index, self) => 
    index === self.findIndex(t => t.name === item.name)
  );

  console.log(`Returning ${uniqueItems.length} unique menu items`);
  return uniqueItems;
}

function transformMenuItem(item: any, date: string, mealPeriod: string, station: string, subCategory: string) {
  console.log('Transforming item with keys:', Object.keys(item));
  
  // Look for name fields
  const possibleNameFields = [
    'Name', 'ItemName', 'MenuItemName', 'DisplayName', 'Title',
    'RecipeName', 'ProductName', 'FoodName', 'Description', 'Label'
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
    console.log('No valid name found for item:', Object.keys(item));
    return null;
  }
  
  // Extract nutritional information
  const getFieldValue = (fieldNames: string[], defaultValue: any = null) => {
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
  };
  
  const transformedItem = {
    id: `alberta-${item.MenuItemId || item.ItemId || item.Id || item.RecipeId || Math.random().toString(36).substr(2, 9)}`,
    name: itemName,
    category: subCategory,
    date: date,
    mealPeriod: mealPeriod,
    station: station,
    subcategory: subCategory,
    servingSize: getFieldValue(['ServingSize', 'PortionSize', 'Serving'], 'Not specified'),
    calories: getFieldValue(['Calories', 'CaloriesPerServing', 'Energy', 'Kcal'], 0),
    protein: getFieldValue(['Protein', 'ProteinG', 'ProteinGrams'], 0),
    fat: getFieldValue(['Fat', 'TotalFat', 'FatG', 'FatGrams'], 0),
    carbs: getFieldValue(['Carbohydrates', 'Carbs', 'TotalCarbohydrates', 'CarbsG'], 0),
    sugars: getFieldValue(['Sugars', 'TotalSugars', 'Sugar'], 0),
    allergens: extractAllergens(item),
    ingredients: item.Ingredients || item.Description || item.LongDescription || '',
    dietary: extractDietaryInfo(item),
    isVegan: getFieldValue(['IsVegan', 'Vegan'], false),
    isVegetarian: getFieldValue(['IsVegetarian', 'Vegetarian'], false)
  };
  
  console.log(`Successfully transformed: ${itemName} from ${station} - ${subCategory}`);
  return transformedItem;
}

function extractAllergens(item: any): string[] {
  const allergenFields = ['Allergens', 'AllergenInfo', 'Allergen', 'AllergenList', 'AllergenStatement'];
  
  for (const field of allergenFields) {
    const allergens = item[field];
    
    if (typeof allergens === 'string' && allergens.trim()) {
      if (allergens.toLowerCase().includes('not available')) {
        return ['Allergen Statement Not Available'];
      }
      return allergens.split(',').map((a: string) => a.trim()).filter(Boolean);
    }
    
    if (Array.isArray(allergens)) {
      return allergens.map(a => typeof a === 'string' ? a : a.Name || a.AllergenName || '').filter(Boolean);
    }
  }
  
  return ['Allergen Statement Not Available'];
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
