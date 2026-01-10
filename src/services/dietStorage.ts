export interface MealPlan {
    id: string;
    type: 'Desayuno' | 'Almuerzo' | 'Once' | 'Cena' | 'Colación';
    time: string; // HH:MM
    description: string;
    enabled: boolean;
}

const STORAGE_KEY = "glucobot_diet_plan";

export const getDietPlan = (): MealPlan[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveMeal = (meal: MealPlan) => {
    const current = getDietPlan();
    // Si ya existe (update), si no (add)
    const index = current.findIndex(m => m.id === meal.id);
    if (index >= 0) {
        current[index] = meal;
    } else {
        current.push(meal);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
};

export const deleteMeal = (id: string) => {
    const current = getDietPlan();
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const toggleMealStatus = (id: string) => {
    const current = getDietPlan();
    const meal = current.find(m => m.id === id);
    if (meal) {
        meal.enabled = !meal.enabled;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }
};
