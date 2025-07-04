
// Mock data structure - easily replaceable with real CampusDish API calls
const mockMenuData = {
  bishops: [
    { id: 'bishops-1', name: 'Grilled Chicken Caesar Salad', category: 'Salads', price: 12.99 },
    { id: 'bishops-2', name: 'Beef Stir Fry with Rice', category: 'Asian', price: 14.50 },
    { id: 'bishops-3', name: 'Vegetarian Pizza', category: 'Pizza', price: 13.25 },
    { id: 'bishops-4', name: 'Fish & Chips', category: 'British', price: 15.99 }
  ],
  carleton: [
    { id: 'carleton-1', name: 'Maple Glazed Salmon', category: 'Seafood', price: 18.99 },
    { id: 'carleton-2', name: 'Poutine Supreme', category: 'Canadian', price: 11.50 },
    { id: 'carleton-3', name: 'Butter Chicken with Naan', category: 'Indian', price: 16.75 },
    { id: 'carleton-4', name: 'Mediterranean Wrap', category: 'Wraps', price: 10.99 }
  ],
  mcmaster: [
    { id: 'mcmaster-1', name: 'BBQ Pulled Pork Sandwich', category: 'Sandwiches', price: 13.99 },
    { id: 'mcmaster-2', name: 'Thai Green Curry', category: 'Thai', price: 15.50 },
    { id: 'mcmaster-3', name: 'Quinoa Power Bowl', category: 'Healthy', price: 12.75 },
    { id: 'mcmaster-4', name: 'Classic Cheeseburger', category: 'Burgers', price: 14.25 }
  ]
};

const mockNutritionData = {
  'bishops-1': {
    name: 'Grilled Chicken Caesar Salad',
    calories: 420,
    protein: 35,
    fat: 18,
    carbs: 25,
    allergens: ['Dairy', 'Eggs'],
    ingredients: 'Romaine lettuce, grilled chicken breast, parmesan cheese, croutons, caesar dressing, lemon juice'
  },
  'bishops-2': {
    name: 'Beef Stir Fry with Rice',
    calories: 580,
    protein: 28,
    fat: 15,
    carbs: 72,
    allergens: ['Soy', 'Sesame'],
    ingredients: 'Beef strips, jasmine rice, bell peppers, broccoli, carrots, soy sauce, sesame oil, garlic, ginger'
  },
  'bishops-3': {
    name: 'Vegetarian Pizza',
    calories: 520,
    protein: 22,
    fat: 20,
    carbs: 65,
    allergens: ['Gluten', 'Dairy'],
    ingredients: 'Pizza dough, tomato sauce, mozzarella cheese, bell peppers, mushrooms, red onions, olives, oregano'
  },
  'bishops-4': {
    name: 'Fish & Chips',
    calories: 680,
    protein: 32,
    fat: 28,
    carbs: 75,
    allergens: ['Fish', 'Gluten'],
    ingredients: 'Cod fillet, russet potatoes, beer batter, tartar sauce, malt vinegar, mushy peas'
  },
  'carleton-1': {
    name: 'Maple Glazed Salmon',
    calories: 450,
    protein: 38,
    fat: 22,
    carbs: 18,
    allergens: ['Fish'],
    ingredients: 'Atlantic salmon, maple syrup, soy sauce, garlic, ginger, asparagus, wild rice'
  },
  'carleton-2': {
    name: 'Poutine Supreme',
    calories: 720,
    protein: 18,
    fat: 35,
    carbs: 85,
    allergens: ['Dairy'],
    ingredients: 'French fries, cheese curds, beef gravy, bacon bits, green onions, sour cream'
  },
  'carleton-3': {
    name: 'Butter Chicken with Naan',
    calories: 620,
    protein: 42,
    fat: 25,
    carbs: 55,
    allergens: ['Dairy', 'Gluten'],
    ingredients: 'Chicken thighs, tomato sauce, heavy cream, butter, garam masala, naan bread, basmati rice'
  },
  'carleton-4': {
    name: 'Mediterranean Wrap',
    calories: 380,
    protein: 20,
    fat: 16,
    carbs: 42,
    allergens: ['Gluten', 'Dairy'],
    ingredients: 'Whole wheat tortilla, grilled chicken, feta cheese, cucumber, tomatoes, red onion, tzatziki sauce'
  },
  'mcmaster-1': {
    name: 'BBQ Pulled Pork Sandwich',
    calories: 650,
    protein: 35,
    fat: 22,
    carbs: 68,
    allergens: ['Gluten'],
    ingredients: 'Pork shoulder, BBQ sauce, brioche bun, coleslaw, pickles, sweet potato fries'
  },
  'mcmaster-2': {
    name: 'Thai Green Curry',
    calories: 480,
    protein: 26,
    fat: 18,
    carbs: 58,
    allergens: ['Coconut'],
    ingredients: 'Chicken breast, coconut milk, green curry paste, thai basil, bell peppers, jasmine rice'
  },
  'mcmaster-3': {
    name: 'Quinoa Power Bowl',
    calories: 420,
    protein: 18,
    fat: 14,
    carbs: 58,
    allergens: [],
    ingredients: 'Quinoa, black beans, avocado, cherry tomatoes, corn, lime vinaigrette, pumpkin seeds'
  },
  'mcmaster-4': {
    name: 'Classic Cheeseburger',
    calories: 590,
    protein: 32,
    fat: 28,
    carbs: 48,
    allergens: ['Gluten', 'Dairy'],
    ingredients: 'Beef patty, cheddar cheese, lettuce, tomato, onion, pickle, sesame seed bun, french fries'
  }
};

// Simulate API delay for realistic experience
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchMenu = async (schoolId: string) => {
  console.log(`Fetching menu for school: ${schoolId}`);
  await delay(500); // Simulate network delay
  
  if (!schoolId || !mockMenuData[schoolId as keyof typeof mockMenuData]) {
    throw new Error('Invalid school ID');
  }
  
  return mockMenuData[schoolId as keyof typeof mockMenuData];
};

export const fetchItem = async (itemId: string) => {
  console.log(`Fetching item details for: ${itemId}`);
  await delay(300); // Simulate network delay
  
  if (!itemId || !mockNutritionData[itemId as keyof typeof mockNutritionData]) {
    throw new Error('Invalid item ID');
  }
  
  return mockNutritionData[itemId as keyof typeof mockNutritionData];
};

// Future integration point - replace these functions with real CampusDish API calls
// Example structure for when you're ready to integrate:
/*
export const fetchMenu = async (schoolId: string) => {
  const response = await fetch(`https://api.campusdish.com/menu?school=${schoolId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.CAMPUSDISH_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch menu');
  }
  
  return response.json();
};

export const fetchItem = async (itemId: string) => {
  const response = await fetch(`https://api.campusdish.com/item/${itemId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.CAMPUSDISH_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch item details');
  }
  
  return response.json();
};
*/
