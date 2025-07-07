// Mock data structure - easily replaceable with real CampusDish API calls
const mockMenuData = {
  bishops: [
    { id: 'bishops-1', name: 'Grilled Chicken Caesar Salad', category: 'Salads' },
    { id: 'bishops-2', name: 'Beef Stir Fry with Rice', category: 'Asian' },
    { id: 'bishops-3', name: 'Vegetarian Pizza', category: 'Pizza' },
    { id: 'bishops-4', name: 'Fish & Chips', category: 'British' }
  ],
  carleton: [
    { id: 'carleton-1', name: 'Maple Glazed Salmon', category: 'Seafood' },
    { id: 'carleton-2', name: 'Poutine Supreme', category: 'Canadian' },
    { id: 'carleton-3', name: 'Butter Chicken with Naan', category: 'Indian' },
    { id: 'carleton-4', name: 'Mediterranean Wrap', category: 'Wraps' }
  ],
  mcmaster: [
    { id: 'mcmaster-1', name: 'BBQ Pulled Pork Sandwich', category: 'Sandwiches' },
    { id: 'mcmaster-2', name: 'Thai Green Curry', category: 'Thai' },
    { id: 'mcmaster-3', name: 'Quinoa Power Bowl', category: 'Healthy' },
    { id: 'mcmaster-4', name: 'Classic Cheeseburger', category: 'Burgers' }
  ],
  alberta: [
    { id: 'alberta-1', name: 'Alberta Beef Brisket', category: 'BBQ' },
    { id: 'alberta-2', name: 'Wild Rice Stuffed Bell Peppers', category: 'Vegetarian' },
    { id: 'alberta-3', name: 'Prairie Chicken Schnitzel', category: 'German' },
    { id: 'alberta-4', name: 'Bison Burger with Sweet Potato Fries', category: 'Burgers' }
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
    ingredients: 'Romaine lettuce, grilled chicken breast, parmesan cheese, croutons, caesar dressing, lemon juice',
    dietary: ['locally-grown']
  },
  'bishops-2': {
    name: 'Beef Stir Fry with Rice',
    calories: 580,
    protein: 28,
    fat: 15,
    carbs: 72,
    allergens: ['Soy', 'Sesame'],
    ingredients: 'Beef strips, jasmine rice, bell peppers, broccoli, carrots, soy sauce, sesame oil, garlic, ginger',
    dietary: ['halal']
  },
  'bishops-3': {
    name: 'Vegetarian Pizza',
    calories: 520,
    protein: 22,
    fat: 20,
    carbs: 65,
    allergens: ['Gluten', 'Dairy'],
    ingredients: 'Pizza dough, tomato sauce, mozzarella cheese, bell peppers, mushrooms, red onions, olives, oregano',
    dietary: ['vegetarian']
  },
  'bishops-4': {
    name: 'Fish & Chips',
    calories: 680,
    protein: 32,
    fat: 28,
    carbs: 75,
    allergens: ['Fish', 'Gluten'],
    ingredients: 'Cod fillet, russet potatoes, beer batter, tartar sauce, malt vinegar, mushy peas',
    dietary: ['sustainable']
  },
  'carleton-1': {
    name: 'Maple Glazed Salmon',
    calories: 450,
    protein: 38,
    fat: 22,
    carbs: 18,
    allergens: ['Fish'],
    ingredients: 'Atlantic salmon, maple syrup, soy sauce, garlic, ginger, asparagus, wild rice',
    dietary: ['sustainable', 'locally-grown']
  },
  'carleton-2': {
    name: 'Poutine Supreme',
    calories: 720,
    protein: 18,
    fat: 35,
    carbs: 85,
    allergens: ['Dairy'],
    ingredients: 'French fries, cheese curds, beef gravy, bacon bits, green onions, sour cream',
    dietary: ['locally-grown']
  },
  'carleton-3': {
    name: 'Butter Chicken with Naan',
    calories: 620,
    protein: 42,
    fat: 25,
    carbs: 55,
    allergens: ['Dairy', 'Gluten'],
    ingredients: 'Chicken thighs, tomato sauce, heavy cream, butter, garam masala, naan bread, basmati rice',
    dietary: ['halal']
  },
  'carleton-4': {
    name: 'Mediterranean Wrap',
    calories: 380,
    protein: 20,
    fat: 16,
    carbs: 42,
    allergens: ['Gluten', 'Dairy'],
    ingredients: 'Whole wheat tortilla, grilled chicken, feta cheese, cucumber, tomatoes, red onion, tzatziki sauce',
    dietary: ['locally-grown']
  },
  'mcmaster-1': {
    name: 'BBQ Pulled Pork Sandwich',
    calories: 650,
    protein: 35,
    fat: 22,
    carbs: 68,
    allergens: ['Gluten'],
    ingredients: 'Pork shoulder, BBQ sauce, brioche bun, coleslaw, pickles, sweet potato fries',
    dietary: ['locally-grown']
  },
  'mcmaster-2': {
    name: 'Thai Green Curry',
    calories: 480,
    protein: 26,
    fat: 18,
    carbs: 58,
    allergens: ['Coconut'],
    ingredients: 'Chicken breast, coconut milk, green curry paste, thai basil, bell peppers, jasmine rice',
    dietary: ['halal', 'gluten-free']
  },
  'mcmaster-3': {
    name: 'Quinoa Power Bowl',
    calories: 420,
    protein: 18,
    fat: 14,
    carbs: 58,
    allergens: [],
    ingredients: 'Quinoa, black beans, avocado, cherry tomatoes, corn, lime vinaigrette, pumpkin seeds',
    dietary: ['vegan', 'gluten-free', 'sustainable']
  },
  'mcmaster-4': {
    name: 'Classic Cheeseburger',
    calories: 590,
    protein: 32,
    fat: 28,
    carbs: 48,
    allergens: ['Gluten', 'Dairy'],
    ingredients: 'Beef patty, cheddar cheese, lettuce, tomato, onion, pickle, sesame seed bun, french fries',
    dietary: ['locally-grown']
  },
  'alberta-1': {
    name: 'Alberta Beef Brisket',
    calories: 720,
    protein: 45,
    fat: 32,
    carbs: 38,
    allergens: ['Gluten'],
    ingredients: 'Alberta beef brisket, BBQ sauce, cornbread, coleslaw, baked beans, pickles',
    dietary: ['locally-grown']
  },
  'alberta-2': {
    name: 'Wild Rice Stuffed Bell Peppers',
    calories: 380,
    protein: 15,
    fat: 8,
    carbs: 68,
    allergens: [],
    ingredients: 'Wild rice, bell peppers, mushrooms, onions, celery, vegetable broth, herbs',
    dietary: ['vegan', 'gluten-free', 'locally-grown']
  },
  'alberta-3': {
    name: 'Prairie Chicken Schnitzel',
    calories: 620,
    protein: 38,
    fat: 28,
    carbs: 48,
    allergens: ['Gluten', 'Eggs'],
    ingredients: 'Chicken breast, breadcrumbs, flour, eggs, spätzle, lingonberry sauce, cucumber salad',
    dietary: ['locally-grown']
  },
  'alberta-4': {
    name: 'Bison Burger with Sweet Potato Fries',
    calories: 680,
    protein: 42,
    fat: 25,
    carbs: 58,
    allergens: ['Gluten'],
    ingredients: 'Ground bison, brioche bun, cheddar cheese, lettuce, tomato, sweet potato fries, aioli',
    dietary: ['locally-grown', 'sustainable']
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
