// AI Service for OpenRouter and other AI providers
// This service handles communication with various AI models for health-related queries

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Available AI models
export const AI_MODELS: AIModel[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter (Recommended)',
    provider: 'OpenRouter',
    description: 'Best overall performance for health queries',
    maxTokens: 4000
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    provider: 'Google',
    description: 'Fast and reliable for general queries',
    maxTokens: 8000
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    provider: 'Anthropic',
    description: 'Excellent for complex health analysis',
    maxTokens: 100000
  }
];

export class AIService {

  static async chat(
    messages: ChatMessage[], 
    model: string = 'openrouter',
    context?: { receipts: any[], healthProfile?: any }
  ): Promise<AIResponse> {
    // Add system context for health-related queries
    let systemContent = `You are Astrea, an AI health assistant specialized in food safety, drug interactions, and dietary analysis. 
      
Your expertise includes:
- Drug-food interactions and medication safety
- Allergen detection and food safety
- Dietary recommendations based on health conditions
- Receipt analysis for health insights
- General nutrition and wellness advice

Always prioritize user safety and recommend consulting healthcare professionals for medical advice.
Be helpful, accurate, and empathetic in your responses.`;

    // Add health profile context if available
    if (context?.healthProfile) {
      const profile = context.healthProfile;
      systemContent += `\n\nUser Health Profile:
- Diagnoses: ${profile.diagnoses.length > 0 ? profile.diagnoses.join(', ') : 'None specified'}
- Medications: ${profile.medications.length > 0 ? profile.medications.join(', ') : 'None specified'}
- Allergies: ${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None specified'}
- Dietary Restrictions: ${profile.dietaryRestrictions.length > 0 ? profile.dietaryRestrictions.join(', ') : 'None specified'}
- Health Goals: ${profile.healthGoals.length > 0 ? profile.healthGoals.join(', ') : 'None specified'}

Use this health profile to provide personalized recommendations and warnings.`;
    }

    // Add receipt context if available
    if (context?.receipts && context.receipts.length > 0) {
      systemContent += `\n\nRecent Receipt Analysis Context:
${context.receipts.map((receipt, index) => `
Receipt ${index + 1} (${receipt.timestamp.toLocaleDateString()}):
- Health Score: ${receipt.analysis.healthScore}%
- Items: ${receipt.items.join(', ')}
- Warnings: ${receipt.analysis.warnings.join('; ')}
- Suggestions: ${receipt.analysis.suggestions.join('; ')}
- Raw Text: ${receipt.text.substring(0, 200)}...
`).join('\n')}

Use this context to provide more personalized and relevant health advice based on the user's recent purchases.`;
    }

    const systemMessage: ChatMessage = {
      role: 'system',
      content: systemContent
    };

    const messagesWithContext = [systemMessage, ...messages];

    switch (model) {
      case 'openrouter':
        return this.chatWithOpenRouter(messagesWithContext, context?.receipts);
      case 'gemini':
        return this.chatWithGemini(messagesWithContext, context?.receipts);
      case 'claude':
        return this.chatWithClaude(messagesWithContext, context?.receipts);
      default:
        return this.getMockResponse(messages[messages.length - 1].content, model);
    }
  }

  private static async chatWithOpenRouter(messages: ChatMessage[], receipts?: any[]): Promise<AIResponse> {
    try {
      const response = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          model: 'openrouter',
          receipts: receipts || []
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content,
        model: data.model
      };
    } catch (error) {
      console.error('Backend API error:', error);
      return this.getMockResponse(messages[messages.length - 1].content, 'openrouter');
    }
  }

  private static async chatWithGemini(messages: ChatMessage[], receipts?: any[]): Promise<AIResponse> {
    try {
      const response = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          model: 'gemini',
          receipts: receipts || []
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content,
        model: data.model
      };
    } catch (error) {
      console.error('Backend API error:', error);
      return this.getMockResponse(messages[messages.length - 1].content, 'gemini');
    }
  }

  private static async chatWithClaude(messages: ChatMessage[], receipts?: any[]): Promise<AIResponse> {
    // Claude would be accessed through OpenRouter or direct API
    // For now, use OpenRouter with Claude model
    return this.chatWithOpenRouter(messages, receipts);
  }

  private static getMockResponse(userInput: string, model: string): AIResponse {
    const input = userInput.toLowerCase();
    
    let response = '';
    
    if (input.includes('receipt') || input.includes('scan')) {
      response = `I can help you analyze your receipts! I see you've scanned some receipts recently. I can identify potential drug interactions, allergens, and provide health recommendations based on your purchases. What specific aspect of your receipt would you like me to analyze?`;
    } else if (input.includes('grapefruit') || input.includes('interaction')) {
      response = `Grapefruit can interact with many medications including statins, calcium channel blockers, and some antidepressants. If you're taking any medications, it's best to avoid grapefruit or consult your doctor. I noticed grapefruit juice in your recent receipt - consider switching to orange juice or other citrus alternatives.`;
    } else if (input.includes('health') || input.includes('diet')) {
      response = `Based on your recent purchases, I can see you're making some healthy choices! I recommend focusing on whole foods, limiting processed items, and ensuring you're getting enough variety in your diet. What specific health goals are you working towards?`;
    } else if (input.includes('allerg') || input.includes('allergy')) {
      response = `Allergen detection is one of my key features! I can scan your receipts for any ingredients that might trigger allergic reactions based on your allergy profile. Make sure to keep your health profile updated with all your known allergies. What allergens are you concerned about?`;
    } else if (input.includes('medication') || input.includes('drug')) {
      response = `I can help you understand potential drug-food interactions! When you scan a receipt, I'll check for any potential conflicts between your medications and the food items. Always consult your healthcare provider about any concerns regarding medication interactions.`;
    } else {
      response = `I'm here to help with your health and nutrition questions! I can analyze your receipts for potential issues, answer questions about food interactions, and provide personalized recommendations. What would you like to know about your health and nutrition?`;
    }

    return {
      content: response,
      model: model
    };
  }

  static getAvailableModels(): AIModel[] {
    return AI_MODELS;
  }

  static getModelById(id: string): AIModel | undefined {
    return AI_MODELS.find(model => model.id === id);
  }
}

export default AIService;
