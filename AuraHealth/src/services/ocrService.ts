// Mock OCR Service for Receipt Processing
// In a real application, this would integrate with actual OCR APIs like:
// - Google Cloud Vision API
// - AWS Textract
// - Azure Computer Vision
// - Tesseract.js for client-side processing

export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface ReceiptData {
  storeName: string;
  date: string;
  time: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  rawText: string;
  healthAnalysis?: HealthAnalysis;
  redFlags?: Array<{ title: string; detail: string; severity: 'low' | 'medium' | 'high' }>;
  budgetSwaps?: Array<{ item: string; swap: string; savings: string }>;
  healthySwaps?: Array<{ item: string; swap: string; reason: string }>;
  mealPlan?: Array<{ 
    name: string; 
    uses: string[]; 
    prep_time: string; 
    difficulty: 'easy' | 'medium' | 'hard'; 
    nutrition_benefits: string; 
  }>;
  alternativeMealPlan?: Array<{ 
    name: string; 
    uses: string[]; 
    prep_time: string; 
    difficulty: 'easy' | 'medium' | 'hard'; 
    nutrition_benefits: string; 
  }>;
  ingredientAnalysis?: Array<{ 
    ingredient: string; 
    health_benefits: string; 
    nutritional_value: string; 
    cooking_tips: string; 
  }>;
  nutrients?: Array<{ name: string; amount: string; daily_value_percent: string }>;
  macros?: {
    calories: string | number;
    protein_g: string | number;
    carbs_g: string | number;
    fat_g: string | number;
    fiber_g: string | number;
    sugar_g: string | number;
    sodium_mg: string | number;
  };
  overallHealthScore?: number;
  suggestions?: Array<{ 
    category: string; 
    title: string; 
    description: string; 
    priority: 'low' | 'medium' | 'high'; 
  }>;
  warnings?: Array<{ 
    type: string; 
    message: string; 
    severity: 'low' | 'medium' | 'high'; 
  }>;
}

export interface HealthAnalysis {
  red_flags: Array<{ title: string; detail: string; severity: 'low' | 'medium' | 'high' }>;
  budget_swaps: Array<{ item: string; swap: string; savings: string }>;
  healthy_swaps: Array<{ item: string; swap: string; reason: string }>;
  meal_plan: Array<{ 
    name: string; 
    uses: string[]; 
    prep_time: string; 
    difficulty: 'easy' | 'medium' | 'hard'; 
    nutrition_benefits: string; 
  }>;
  alternative_meal_plan: Array<{ 
    name: string; 
    uses: string[]; 
    prep_time: string; 
    difficulty: 'easy' | 'medium' | 'hard'; 
    nutrition_benefits: string; 
  }>;
  ingredient_analysis: Array<{ 
    ingredient: string; 
    health_benefits: string; 
    nutritional_value: string; 
    cooking_tips: string; 
  }>;
  nutrients: Array<{ name: string; amount: string; daily_value_percent: string }>;
  macros: {
    calories: string | number;
    protein_g: string | number;
    carbs_g: string | number;
    fat_g: string | number;
    fiber_g: string | number;
    sugar_g: string | number;
    sodium_mg: string | number;
  };
  overall_health_score: number;
  suggestions: Array<{ 
    category: string; 
    title: string; 
    description: string; 
    priority: 'low' | 'medium' | 'high'; 
  }>;
  warnings: Array<{ 
    type: string; 
    message: string; 
    severity: 'low' | 'medium' | 'high'; 
  }>;
}

// Constants removed - now using real backend analysis

// Removed unused dietary conflicts constant

const API_BASE_URL = 'http://localhost:8000/api';

export class OCRService {
  static async processReceipt(imageData: string): Promise<ReceiptData> {
    try {
      console.log('Processing receipt with Gemini directly...');
      console.log('Image data length:', imageData.length);
      console.log('API URL:', `${API_BASE_URL}/ocr/process`);
      
      // Create form data manually to avoid URLSearchParams issues with large data
      const formData = new FormData();
      formData.append('image_data', imageData);
      
      const response = await fetch(`${API_BASE_URL}/ocr/process`, {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Gemini response data:', data);
      console.log('Items extracted:', data.items?.length || 0);
      console.log('Raw text length:', data.raw_text?.length || 0);
      
      // Convert backend response to frontend format
      return {
        storeName: data.raw_text?.includes('SUPERMARKET') ? 'SUPERMARKET GROCERY' : 'Receipt Store',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        items: data.items?.map((item: any) => ({
          name: item.name || 'Unknown Item',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1,
          category: item.category || 'general',
          nutrition: item.nutrition ? {
            carbohydrates: parseFloat(item.nutrition.carbohydrates) || 0,
            protein: parseFloat(item.nutrition.protein) || 0,
            fats: parseFloat(item.nutrition.fats) || 0,
            fiber: parseFloat(item.nutrition.fiber) || 0,
            sugar: parseFloat(item.nutrition.sugar) || 0,
            sodium: parseFloat(item.nutrition.sodium) || 0,
            calories: parseFloat(item.nutrition.calories) || 0
          } : undefined
        })) || [],
        subtotal: data.items?.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0), 0) || 0,
        tax: 0, // Could be calculated
        total: data.items?.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0), 0) || 0,
        rawText: data.raw_text || '',
        healthAnalysis: data, // Include full health analysis from backend
        redFlags: data.red_flags || [],
        budgetSwaps: data.budget_swaps || [],
        healthySwaps: data.healthy_swaps || [],
        mealPlan: data.meal_plan || [],
        alternativeMealPlan: data.alternative_meal_plan || [],
        ingredientAnalysis: data.ingredient_analysis || [],
        nutrients: data.nutrients || [],
        macros: data.macros || {},
        overallHealthScore: data.overall_health_score || 0,
        suggestions: data.suggestions || [],
        warnings: data.warnings || []
      };
    } catch (error) {
      console.error('Receipt processing error:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Failed to process receipt: Network error - Please check if the backend server is running');
      }
      
      // Throw error instead of falling back to mock data
      throw new Error(`Failed to process receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Health analysis is now handled by the backend in the processReceipt call
  // This method is kept for compatibility but not used
  static async analyzeHealth(_receiptData: ReceiptData): Promise<HealthAnalysis> {
    throw new Error('Health analysis is now handled by the backend in processReceipt');
  }

  // Mock data methods removed - now using real OCR processing
}

// Export for use in components
export default OCRService;

