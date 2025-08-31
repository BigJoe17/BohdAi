import { GoogleGenerativeAI } from '@google/generative-ai';

// Emotion detection types
export interface EmotionData {
  emotion: EmotionLabel;
  confidence: number;
  timestamp: number;
  secondsFromStart: number;
  duration?: number;
  intensity: 'low' | 'medium' | 'high';
  additionalMetrics?: {
    stress_level?: number;
    energy_level?: number;
    speaking_pace?: 'slow' | 'normal' | 'fast';
    voice_stability?: number;
  };
}

export type EmotionLabel = 
  | 'happy' 
  | 'neutral' 
  | 'nervous' 
  | 'confident' 
  | 'stressed' 
  | 'excited' 
  | 'disappointed' 
  | 'frustrated' 
  | 'calm' 
  | 'uncertain';

export interface EmotionAnalysisResult {
  emotions: EmotionData[];
  dominantEmotion: EmotionLabel;
  emotionalTrend: 'improving' | 'declining' | 'stable';
  summary: {
    averageConfidence: number;
    mostFrequentEmotion: EmotionLabel;
    emotionalStability: number;
    stressIndicators: string[];
  };
}

interface AudioFeatures {
  pitch: number[];
  energy: number[];
  spectralCentroid: number[];
  zeroCrossingRate: number[];
  mfcc: number[][];
}

class EmotionDetectionService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.warn('Google AI API key not found. Emotion detection will use fallback analysis.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Analyze text transcript for emotional content using Gemini AI
   */
  async analyzeTextEmotion(
    text: string, 
    timestamp: number, 
    speakingDuration: number = 0
  ): Promise<EmotionData> {
    try {
      const prompt = `
        Analyze the emotional tone and sentiment of this interview response:
        
        Text: "${text}"
        
        Please provide a JSON response with the following structure:
        {
          "emotion": "happy|neutral|nervous|confident|stressed|excited|disappointed|frustrated|calm|uncertain",
          "confidence": 0.85,
          "intensity": "low|medium|high",
          "stress_level": 0.3,
          "energy_level": 0.7,
          "speaking_pace": "normal",
          "voice_stability": 0.8,
          "reasoning": "Brief explanation of the analysis"
        }
        
        Consider:
        - Word choice and language patterns
        - Confidence indicators (certainty vs uncertainty)
        - Stress markers (hesitation, repetition, filler words)
        - Positive/negative sentiment
        - Professional communication style
        
        Return only the JSON object.
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      return {
        emotion: analysis.emotion as EmotionLabel,
        confidence: Math.min(Math.max(analysis.confidence || 0.5, 0), 1),
        timestamp,
        secondsFromStart: timestamp / 1000,
        duration: speakingDuration,
        intensity: analysis.intensity || 'medium',
        additionalMetrics: {
          stress_level: analysis.stress_level || 0.5,
          energy_level: analysis.energy_level || 0.5,
          speaking_pace: analysis.speaking_pace || 'normal',
          voice_stability: analysis.voice_stability || 0.5,
        }
      };

    } catch (error) {
      console.error('Error analyzing text emotion:', error);
      
      // Fallback to rule-based emotion detection
      return this.fallbackTextAnalysis(text, timestamp, speakingDuration);
    }
  }

  /**
   * Fallback rule-based emotion detection for text
   */
  private fallbackTextAnalysis(
    text: string, 
    timestamp: number, 
    speakingDuration: number
  ): EmotionData {
    const lowerText = text.toLowerCase();
    
    // Define emotion keywords and patterns
    const emotionPatterns = {
      confident: ['sure', 'definitely', 'absolutely', 'i know', 'certain', 'experience'],
      nervous: ['um', 'uh', 'i think', 'maybe', 'not sure', 'i guess'],
      excited: ['great', 'amazing', 'love', 'excited', 'fantastic', 'wonderful'],
      stressed: ['difficult', 'hard', 'struggle', 'challenging', 'overwhelming'],
      frustrated: ['but', 'however', 'unfortunately', 'problem', 'issue'],
      calm: ['okay', 'fine', 'alright', 'steady', 'stable'],
      happy: ['good', 'well', 'positive', 'pleased', 'satisfied'],
      disappointed: ['not good', 'unfortunately', 'sadly', 'failed', 'disappointed']
    };

    let maxScore = 0;
    let detectedEmotion: EmotionLabel = 'neutral';
    
    // Calculate scores for each emotion
    Object.entries(emotionPatterns).forEach(([emotion, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        const occurrences = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
        return acc + occurrences;
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion as EmotionLabel;
      }
    });

    // Calculate confidence based on text length and keyword density
    const wordCount = text.split(' ').length;
    const confidence = Math.min(0.3 + (maxScore / wordCount) * 2, 0.85);

    // Determine intensity based on text features
    const hasCapitals = /[A-Z]{2,}/.test(text);
    const hasExclamation = text.includes('!');
    const hasQuestion = text.includes('?');
    
    let intensity: 'low' | 'medium' | 'high' = 'medium';
    if (hasCapitals || hasExclamation || maxScore > 2) {
      intensity = 'high';
    } else if (maxScore === 0 || text.length < 20) {
      intensity = 'low';
    }

    return {
      emotion: detectedEmotion,
      confidence,
      timestamp,
      secondsFromStart: timestamp / 1000,
      duration: speakingDuration,
      intensity,
      additionalMetrics: {
        stress_level: ['nervous', 'stressed'].includes(detectedEmotion) ? 0.7 : 0.3,
        energy_level: ['excited', 'confident'].includes(detectedEmotion) ? 0.8 : 0.5,
        speaking_pace: wordCount > 50 ? 'fast' : wordCount < 20 ? 'slow' : 'normal',
        voice_stability: confidence
      }
    };
  }

  /**
   * Process a complete interview transcript and generate emotion timeline
   */
  async analyzeCompleteTranscript(messages: any[]): Promise<EmotionAnalysisResult> {
    const emotions: EmotionData[] = [];
    
    // Filter for user messages only (candidate responses)
    const userMessages = messages.filter(msg => 
      msg.role === 'user' && 
      msg.message && 
      msg.message.trim().length > 0
    );

    // Process each user message
    for (const message of userMessages) {
      const emotionData = await this.analyzeTextEmotion(
        message.message,
        message.time || Date.now(),
        message.duration || 0
      );
      emotions.push(emotionData);
    }

    // Calculate summary metrics
    const summary = this.calculateEmotionSummary(emotions);
    
    return {
      emotions,
      dominantEmotion: summary.mostFrequentEmotion,
      emotionalTrend: this.calculateEmotionalTrend(emotions),
      summary
    };
  }

  /**
   * Real-time emotion detection for streaming transcript
   */
  async processStreamingMessage(
    message: string,
    timestamp: number,
    isPartial: boolean = false
  ): Promise<EmotionData | null> {
    // Only process final transcripts to avoid too many API calls
    if (isPartial || message.trim().length < 10) {
      return null;
    }

    return await this.analyzeTextEmotion(message, timestamp);
  }

  /**
   * Calculate emotion summary statistics
   */
  private calculateEmotionSummary(emotions: EmotionData[]) {
    if (emotions.length === 0) {
      return {
        averageConfidence: 0,
        mostFrequentEmotion: 'neutral' as EmotionLabel,
        emotionalStability: 0,
        stressIndicators: []
      };
    }

    // Calculate average confidence
    const averageConfidence = emotions.reduce((sum, e) => sum + e.confidence, 0) / emotions.length;

    // Find most frequent emotion
    const emotionCounts = emotions.reduce((acc, e) => {
      acc[e.emotion] = (acc[e.emotion] || 0) + 1;
      return acc;
    }, {} as Record<EmotionLabel, number>);

    const mostFrequentEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as EmotionLabel;

    // Calculate emotional stability (less variation = more stable)
    const uniqueEmotions = new Set(emotions.map(e => e.emotion)).size;
    const emotionalStability = Math.max(0, 1 - (uniqueEmotions / emotions.length));

    // Identify stress indicators
    const stressIndicators: string[] = [];
    const stressedCount = emotions.filter(e => e.emotion === 'stressed' || e.emotion === 'nervous').length;
    const averageStress = emotions.reduce((sum, e) => sum + (e.additionalMetrics?.stress_level || 0), 0) / emotions.length;

    if (stressedCount > emotions.length * 0.3) {
      stressIndicators.push('High frequency of stressed/nervous responses');
    }
    if (averageStress > 0.6) {
      stressIndicators.push('Elevated stress levels detected');
    }
    if (emotionalStability < 0.5) {
      stressIndicators.push('High emotional volatility');
    }

    return {
      averageConfidence,
      mostFrequentEmotion,
      emotionalStability,
      stressIndicators
    };
  }

  /**
   * Calculate emotional trend over time
   */
  private calculateEmotionalTrend(emotions: EmotionData[]): 'improving' | 'declining' | 'stable' {
    if (emotions.length < 3) return 'stable';

    const positiveEmotions = ['happy', 'confident', 'excited', 'calm'];
    const negativeEmotions = ['nervous', 'stressed', 'frustrated', 'disappointed', 'uncertain'];

    const firstHalf = emotions.slice(0, Math.floor(emotions.length / 2));
    const secondHalf = emotions.slice(Math.floor(emotions.length / 2));

    const firstHalfPositive = firstHalf.filter(e => positiveEmotions.includes(e.emotion)).length / firstHalf.length;
    const secondHalfPositive = secondHalf.filter(e => positiveEmotions.includes(e.emotion)).length / secondHalf.length;

    const improvement = secondHalfPositive - firstHalfPositive;

    if (improvement > 0.1) return 'improving';
    if (improvement < -0.1) return 'declining';
    return 'stable';
  }

  /**
   * Get emotion color for visualization
   */
  getEmotionColor(emotion: EmotionLabel): string {
    const colorMap: Record<EmotionLabel, string> = {
      happy: '#10B981',      // green
      confident: '#3B82F6',  // blue
      excited: '#F59E0B',    // amber
      calm: '#6366F1',       // indigo
      neutral: '#6B7280',    // gray
      nervous: '#EF4444',    // red
      stressed: '#DC2626',   // red-600
      frustrated: '#B91C1C', // red-700
      disappointed: '#7C2D12', // orange-900
      uncertain: '#D97706'   // orange-600
    };
    return colorMap[emotion] || '#6B7280';
  }


}

export const emotionDetectionService = new EmotionDetectionService();
