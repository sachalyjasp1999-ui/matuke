export interface UserProfile {
  id: string
  full_name?: string
  phone?: string
  avatar_url?: string
  dietary_preferences?: string[]
  allergies?: string[]
  cooking_skill?: 'iniciante' | 'intermediário' | 'avançado'
  household_size: number
  credits: number
  trial_used: boolean
  subscription_status: 'trial' | 'active' | 'expired'
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  title: string
  description?: string
  ingredients: Ingredient[]
  instructions: Instruction[]
  prep_time?: number
  cook_time?: number
  servings: number
  difficulty?: 'fácil' | 'médio' | 'difícil'
  cuisine_type?: string
  category?: string
  image_url?: string
  nutrition_info?: NutritionInfo
  tags?: string[]
  user_id?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Ingredient {
  name: string
  quantity: string
  unit: string
}

export interface Instruction {
  step: number
  description: string
}

export interface NutritionInfo {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
}

export interface MealPlan {
  id: string
  user_id: string
  recipe_id: string
  meal_date: string
  meal_type: 'pequeno-almoço' | 'almoço' | 'jantar' | 'lanche'
  servings: number
  notes?: string
  recipe?: Recipe
  created_at: string
  updated_at: string
}

export interface ShoppingList {
  id: string
  user_id: string
  name: string
  items: ShoppingItem[]
  start_date?: string
  end_date?: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface ShoppingItem {
  name: string
  quantity: string
  unit: string
  checked: boolean
  recipe_id?: string
}

export interface SearchHistory {
  id: string
  user_id: string
  search_type: 'text' | 'image'
  search_query?: string
  image_url?: string
  results_count: number
  credits_used: number
  created_at: string
}
