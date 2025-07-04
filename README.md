
# CampusDish Meal Finder

A modern React application for browsing university meal options with detailed nutrition information.

## Features

- **School Selection**: Choose from Bishop's University, Carleton University, or McMaster University
- **Dynamic Menu Loading**: Browse available meals for each selected school
- **Detailed Nutrition Facts**: View calories, protein, fat, carbs, allergens, and ingredients
- **Responsive Design**: Beautiful, mobile-friendly interface built with Tailwind CSS
- **Mock API Structure**: Easily replaceable with real CampusDish API integration

## Technologies Used

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **TanStack Query** for data fetching and caching
- **Lucide React** for icons

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:8080` to view the application

## Project Structure

```
src/
├── pages/
│   └── Index.tsx              # Main application page
├── services/
│   └── menuService.ts         # API service layer with mock data
├── components/ui/             # Reusable UI components
└── lib/
    └── utils.ts              # Utility functions
```

## Mock Data Location

All mock data is located in `src/services/menuService.ts`:

- **Menu Items**: `mockMenuData` object contains meals for each school
- **Nutrition Data**: `mockNutritionData` object contains detailed nutrition information
- **API Functions**: `fetchMenu()` and `fetchItem()` simulate API calls with realistic delays

## Integrating Real CampusDish API

To replace mock data with real CampusDish API calls:

1. **Update the service functions** in `src/services/menuService.ts`
2. **Replace mock data** with actual API endpoints
3. **Add authentication** headers as needed
4. **Handle real error cases** and response formats

Example structure is provided in comments within the service file.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### School Selection
Users can select from three universities using a dropdown menu. Each school has a unique set of meal options.

### Menu Display
- Shows available meals for the selected school
- Displays meal name, category, and price
- Clicking a meal loads detailed nutrition information

### Nutrition Facts
- Comprehensive nutrition breakdown (calories, protein, fat, carbs)
- Allergen warnings with visual badges
- Complete ingredient lists
- Color-coded nutrition grid for easy reading

### Responsive Design
- Mobile-first approach
- Grid layout adapts to different screen sizes
- Touch-friendly interface elements

## Customization

The application is designed to be easily customizable:

- **Colors**: Update Tailwind classes or extend the theme
- **Schools**: Modify the `schools` array in `Index.tsx`
- **Menu Items**: Update `mockMenuData` in `menuService.ts`
- **Nutrition Data**: Modify `mockNutritionData` structure as needed

## Future Enhancements

- User authentication and preferences
- Meal planning and favorites
- Real-time menu updates
- Dietary restriction filtering
- Meal reviews and ratings
