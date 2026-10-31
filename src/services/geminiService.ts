// TripGuard AI - Google Gemini API Integration & Intelligent Multi-Agent Engine
import { 
  Trip, 
  ItineraryData, 
  Disruption, 
  ReplanningDiffItem, 
  ValidationResult,
  Activity,
  DayPlan 
} from '../types';

export interface GeminiConfig {
  apiKey?: string;
  model?: string;
}

export class GeminiService {
  private apiKey: string = '';
  private model: string = 'gemini-1.5-flash';

  constructor() {
    this.apiKey = localStorage.getItem('tripguard_gemini_api_key') || 
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
  }

  setApiKey(key: string) {
    this.apiKey = key.trim();
    if (this.apiKey) {
      localStorage.setItem('tripguard_gemini_api_key', this.apiKey);
    } else {
      localStorage.removeItem('tripguard_gemini_api_key');
    }
  }

  getApiKey(): string {
    return this.apiKey;
  }

  hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  /**
   * Calls Google Gemini REST endpoint with strict JSON schema instructions
   */
  async generateStructuredJSON<T>(systemInstruction: string, prompt: string): Promise<T | null> {
    if (!this.hasApiKey()) {
      return null;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[GeminiService] API call returned ${response.status}:`, errorText);
        return null;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;

      return JSON.parse(rawText) as T;
    } catch (err) {
      console.warn('[GeminiService] Failed to generate structured JSON from Gemini:', err);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
