
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Course, SkillScore, MistakeAnalysis } from "../types";

const getAI = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API Key (import.meta.env.VITE_API_KEY)");
  return new GoogleGenAI({ apiKey });
};

export const generateQuiz = async (
  topic: string, 
  count: number = 10, 
  forcedDifficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
): Promise<Question[]> => {
  const ai = getAI();
  
  const difficultyContext = forcedDifficulty 
    ? `The entire quiz MUST be at the ${forcedDifficulty} level.`
    : `The quiz should have a balanced distribution: 30% Beginner, 40% Intermediate, 30% Advanced.`;

  const randomSeed = Math.random().toString(36).substring(7);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Act as a Senior Educational Psychometrist and Subject Matter Expert. 
      Generate a ${count}-question assessment for the topic: "${topic}".
      
      VARIETY & UNIQUENESS PROTOCOL: 
      - Current Instance Seed: ${randomSeed}
      - Do NOT use common introductory questions. 
      - Rotate through different conceptual domains within the topic.
      - Ensure a fresh conceptual focus.

      SPECIFICATIONS:
      1. Difficulty: ${difficultyContext}
      2. Explanation: Provide a deep technical explanation for why the correct answer is right.
      3. Format: Return valid JSON array matching the schema.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING, description: "Deep technical explanation of the correct answer." },
            topic: { type: Type.STRING, description: "The specific sub-topic or concept being tested (e.g., 'Memory Management', 'Asynchronous Patterns'). This MUST be more specific than the main topic." },
            difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] }
          },
          required: ["id", "question", "options", "correctAnswer", "explanation", "topic", "difficulty"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const searchCourses = async (query: string): Promise<Course[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      Act as a Global Education Advisor with real-time web access.
      TASK: Find 6 HIGH-QUALITY and REAL online courses for the query: "${query}".
      
      CRITICAL PROTOCOL:
      1. Use Google Search to find current, working enrollment links from Coursera, Udemy, edX, LinkedIn Learning, or Pluralsight.
      2. Verify that the "url" property is a valid, direct link to the course page.
      3. Ensure the course title and provider match the search results exactly.
      4. If a specific course URL is unavailable, find a similar high-quality alternative.
      5. Provide a diverse mix of levels and providers.

      Generate the response as a valid JSON array of course objects.
    `,
    config: {
      tools: [{googleSearch: {}}],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            provider: { type: Type.STRING },
            url: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            level: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
            description: { type: Type.STRING },
            price: { type: Type.STRING },
            isFree: { type: Type.BOOLEAN },
            durationHours: { type: Type.NUMBER },
            duration: { type: Type.STRING },
            recommendationType: { type: Type.STRING, enum: ['CONTENT_MATCH', 'NEURAL_PREDICT'] },
            matchReason: { type: Type.STRING },
            matchScore: { type: Type.NUMBER }
          },
          required: ["id", "title", "provider", "url", "rating", "level", "isFree", "duration", "recommendationType", "matchReason", "matchScore"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const processFeedback = async (rating: number, comment: string, category: string): Promise<{ acknowledgement: string, command: string, logEntry: string }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Act as the LearnPulse Neural Mastery Engine Architect.
      Analyze this feedback: Rating ${rating}/5, Category ${category}, Comment: "${comment}".
      
      TASK:
      1. acknowledgement: A specific 1-sentence response.
      2. command: One of: ["ADJUST_LEVEL_BEGINNER", "ADJUST_LEVEL_ADVANCED", "ACTIVATE_FOCUS_MODE", "GRANT_BADGE", "NONE"]
      3. logEntry: A technical-sounding system update message (e.g., "[SYS] UI vectors shifted by 0.4 based on design feedback").
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          acknowledgement: { type: Type.STRING },
          command: { type: Type.STRING },
          logEntry: { type: Type.STRING }
        },
        required: ["acknowledgement", "command", "logEntry"]
      }
    }
  });
  
  return JSON.parse(response.text || '{"acknowledgement": "Logged.", "command": "NONE", "logEntry": "[SYS] Feedback recorded."}');
};

export const getHybridRecommendations = async (
  scores: SkillScore[], 
  weakAreas: string[], 
  strengths: string[], 
  domain: string
): Promise<{ recommendations: Course[], persona: string }> => {
  const ai = getAI();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      Act as a Learning Path Strategist with real-time web access.
      TASK: Recommend 6 REAL and CURRENT online courses for a student interested in "${domain}".
      
      USER CONTEXT:
      - Identified Strengths: ${strengths.join(', ')}
      - Knowledge Gaps: ${weakAreas.join(', ')}
      - Performance Data: ${JSON.stringify(scores)}

      CRITICAL URL PROTOCOL:
      1. Use Google Search to find current, working enrollment links from Coursera, Udemy, edX, LinkedIn Learning, or Pluralsight.
      2. Verify that the "url" property is a valid, direct link to the course page.
      3. Ensure the course title and provider match the search results exactly.
      4. Do NOT generate hallucinated URLs. If a specific course URL is unavailable, find a similar high-quality alternative.

      Generate the response as a valid JSON object matching the provided schema.
    `,
    config: {
      tools: [{googleSearch: {}}],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          learningPersona: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                provider: { type: Type.STRING },
                url: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                level: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
                description: { type: Type.STRING },
                price: { type: Type.STRING },
                isFree: { type: Type.BOOLEAN },
                durationHours: { type: Type.NUMBER },
                duration: { type: Type.STRING },
                recommendationType: { type: Type.STRING, enum: ['CONTENT_MATCH', 'NEURAL_PREDICT'] },
                matchReason: { type: Type.STRING },
                matchScore: { type: Type.NUMBER }
              },
              required: ["id", "title", "provider", "url", "rating", "level", "isFree", "duration", "recommendationType", "matchReason", "matchScore"]
            }
          }
        },
        required: ["learningPersona", "recommendations"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  return {
    recommendations: data.recommendations || [],
    persona: data.learningPersona || "The Continuous Learner"
  };
};

export const analyzeMistake = async (
  question: Question,
  userAnswerIdx: number
): Promise<MistakeAnalysis> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      DEEP DIVE ANALYSIS:
      Question: "${question.question}"
      User Selection: "${question.options[userAnswerIdx]}"
      Correct Answer: "${question.options[question.correctAnswer]}"
      Concept: "${question.explanation}"
      
      Explain why the user's choice is a common misconception and how to avoid it.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          contrastReasoning: { type: Type.STRING },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { title: { type: Type.STRING }, url: { type: Type.STRING } }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};
