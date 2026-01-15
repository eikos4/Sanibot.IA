// Diet Storage - Local Version (Works offline)

export interface MealPlan {
    id: string;
    type: 'Desayuno' | 'Almuerzo' | 'Once' | 'Cena' | 'Colación';
    time: string;
    description: string;
    enabled: boolean;
}

const STORAGE_KEY = "glucobot_diet_plan";

// Get all meals from localStorage
export const getDietPlan = async (): Promise<MealPlan[]> => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

// Save all meals to localStorage
const saveMeals = (meals: MealPlan[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
};

// Add a new meal
export const saveMeal = async (meal: Omit<MealPlan, "id">) => {
    const meals = await getDietPlan();
    const newMeal: MealPlan = {
        ...meal,
        id: Date.now().toString()
    };
    meals.push(newMeal);
    saveMeals(meals);
};

// Delete a meal
export const deleteMeal = async (id: string) => {
    const meals = await getDietPlan();
    const filtered = meals.filter(m => m.id !== id);
    saveMeals(filtered);
};

// Toggle meal enabled status
export const toggleMealStatus = async (id: string, currentStatus: boolean) => {
    const meals = await getDietPlan();
    const updated = meals.map(m =>
        m.id === id ? { ...m, enabled: !currentStatus } : m
    );
    saveMeals(updated);
};
